import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { createUploadUrl } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const b = await req.json();
    const originalName = String(b.originalName || "");
    const previewName = String(b.previewName || "");
    const originalType = String(b.originalType || "");
    const previewType = String(b.previewType || "");
    if (!originalName || !previewName || !originalType.startsWith("image/") || !previewType.startsWith("image/")) {
      return NextResponse.json({ error: "Two valid image files are required." }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const originalKey = `originals/${id}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const previewKey = `previews/${id}-${previewName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const [original, preview] = await Promise.all([createUploadUrl(originalKey, originalType), createUploadUrl(previewKey, previewType)]);
    return NextResponse.json({ original: { url: original, key: originalKey }, preview: { url: preview, key: previewKey } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unauthorized" }, { status: 401 });
  }
}
