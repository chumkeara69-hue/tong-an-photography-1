import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(_: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  const { accessToken } = await params;
  const order = await prisma.order.findUnique({ where: { accessToken }, include: { items: { include: { photo: true, download: true } }, customer: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({
    orderNumber: order.orderNumber, email: order.customer?.email, totalCents: order.totalCents,
    paymentStatus: order.paymentStatus, orderStatus: order.orderStatus,
    items: order.items.map(i => ({ title: i.photo.title, priceCents: i.priceCents, downloadReady: Boolean(i.download) && order.paymentStatus === "PAID", downloadUrl: i.download && order.paymentStatus === "PAID" ? `/api/download/${i.download.id}` : null }))
  });
}
