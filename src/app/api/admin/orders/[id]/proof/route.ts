import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order?.paymentProofStorageKey) return NextResponse.json({ error: "No proof" }, { status: 404 });
    if (!process.env.AWS_REGION || !process.env.S3_BUCKET) return NextResponse.json({ error: "S3 is not configured" }, { status: 500 });
    const client = new S3Client({ region: process.env.AWS_REGION });
    const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: order.paymentProofStorageKey }), { expiresIn: 300 });
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
