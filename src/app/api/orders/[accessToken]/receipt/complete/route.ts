import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  try {
    const { accessToken } = await params;
    const { key } = await req.json();
    if (!key || typeof key !== "string" || !key.startsWith("payment-proofs/")) {
      return NextResponse.json({ error: "Invalid payment proof." }, { status: 400 });
    }
    const order = await prisma.order.findUnique({ where: { accessToken } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paymentStatus === "PAID") return NextResponse.json({ error: "Payment is already approved." }, { status: 409 });
    if (!key.startsWith(`payment-proofs/${order.id}-`)) {
      return NextResponse.json({ error: "Invalid payment proof." }, { status: 400 });
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { paymentProofStorageKey: key, paymentStatus: "PENDING", orderStatus: "PROCESSING" },
    });
    return NextResponse.json({ ok: true, orderNumber: updated.orderNumber });
  } catch {
    return NextResponse.json({ error: "Could not save payment proof." }, { status: 400 });
  }
}
