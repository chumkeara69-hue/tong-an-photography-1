import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { makeDownloadToken } from "@/lib/order";
import { STORE } from "@/lib/store-config";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (!order.paymentProofStorageKey) return NextResponse.json({ error: "Payment receipt has not been submitted." }, { status: 400 });
    if (order.paymentStatus === "PAID") return NextResponse.json({ ok: true, alreadyApproved: true });
    if (order.paymentStatus !== "PENDING") return NextResponse.json({ error: "Order is not awaiting payment approval." }, { status: 409 });

    await prisma.$transaction(async tx => {
      await tx.order.update({
        where: { id },
        data: {
          paymentStatus: "PAID",
          orderStatus: "COMPLETED",
          paidAt: new Date(),
          paymentRef: `MANUAL-${Date.now()}`,
        },
      });
      for (const item of order.items) {
        const exists = await tx.download.findUnique({ where: { orderItemId: item.id } });
        if (!exists) {
          await tx.download.create({
            data: {
              orderItemId: item.id,
              tokenHash: makeDownloadToken(),
              expiresAt: new Date(Date.now() + STORE.downloadExpiryDays * 86400000),
              maxDownloads: STORE.maxDownloads,
            },
          });
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unauthorized" }, { status: 401 });
  }
}
