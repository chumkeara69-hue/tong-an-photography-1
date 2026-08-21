import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUploadUrl } from "@/lib/storage";

const MAX_PROOF_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function POST(req: Request, { params }: { params: Promise<{ accessToken: string }> }) {
  try {
    const { accessToken } = await params;
    const order = await prisma.order.findUnique({ where: { accessToken } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paymentStatus === "PAID") return NextResponse.json({ error: "Payment is already approved." }, { status: 409 });

    const b = await req.json();
    const fileName = String(b.fileName || "");
    const fileType = String(b.fileType || "").toLowerCase();
    const fileSize = Number(b.fileSize || 0);
    if (!fileName || !ALLOWED_TYPES.has(fileType)) {
      return NextResponse.json({ error: "Upload a JPG, PNG, WebP image, or PDF receipt." }, { status: 400 });
    }
    if (fileSize <= 0 || fileSize > MAX_PROOF_BYTES) {
      return NextResponse.json({ error: "Receipt must be smaller than 10 MB." }, { status: 400 });
    }

    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const key = `payment-proofs/${order.id}-${Date.now()}-${safe}`;
    const url = await createUploadUrl(key, fileType);
    return NextResponse.json({ url, key });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload setup failed" }, { status: 400 });
  }
}
