import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function GET(_: Request, { params }: { params: Promise<{ downloadId: string }> }) {
  const { downloadId } = await params;
  const d = await prisma.download.findUnique({ where: { id: downloadId }, include: { orderItem: { include: { order: true, photo: true } } } });
  if (!d) return NextResponse.json({ error: "Download not found" }, { status: 404 });
  if (d.orderItem.order.paymentStatus !== "PAID") return NextResponse.json({ error: "Payment is not verified." }, { status: 403 });
  if (d.expiresAt < new Date()) return NextResponse.json({ error: "Download link expired." }, { status: 410 });
  if (d.downloadCount >= d.maxDownloads) return NextResponse.json({ error: "Download limit reached." }, { status: 429 });
  if (!process.env.AWS_REGION || !process.env.S3_BUCKET) return NextResponse.json({ error: "S3 is not configured" }, { status: 500 });

  const client = new S3Client({ region: process.env.AWS_REGION });
  const url = await getSignedUrl(client, new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: d.orderItem.photo.originalStorageKey,
    ResponseContentDisposition: `attachment; filename="${d.orderItem.photo.title.replace(/[^a-zA-Z0-9._-]/g, "_")}.jpg"`,
  }), { expiresIn: 300 });

  await prisma.download.update({ where: { id: d.id }, data: { downloadCount: { increment: 1 } } });
  return NextResponse.redirect(url);
}
