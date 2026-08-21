import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeAccessToken, makeOrderNumber } from "@/lib/order";
import { z } from "zod";

const schema = z.object({
  items: z.array(z.object({ photoId: z.string(), quantity: z.number().int().min(1).max(1) })).min(1),
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const ids = body.items.map(i => i.photoId);
    const photos = await prisma.photo.findMany({ where: { id: { in: ids }, status: "PUBLISHED" } });
    if (photos.length !== ids.length) return NextResponse.json({ error: "One or more photos are unavailable." }, { status: 400 });

    const totalCents = photos.reduce((sum, p) => sum + p.priceCents, 0);
    const order = await prisma.order.create({
      data: {
        orderNumber: makeOrderNumber(),
        accessToken: makeAccessToken(),
        totalCents,
        paymentMethod: "KHQR",
        customer: { connectOrCreate: { where: { email: body.email.toLowerCase() }, create: { email: body.email.toLowerCase(), name: body.email.split("@")[0], passwordHash: "", role: "CUSTOMER" } } },
        items: { create: photos.map(p => ({ photoId: p.id, priceCents: p.priceCents })) },
      },
      include: { items: true },
    });
    return NextResponse.json({ ok: true, accessToken: order.accessToken, orderNumber: order.orderNumber });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not create order" }, { status: 400 });
  }
}
