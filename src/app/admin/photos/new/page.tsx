"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPhoto() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const f = new FormData(e.currentTarget);
      const data = Object.fromEntries(f.entries());
      const original = f.get("original") as File;
      const preview = f.get("preview") as File;
      if (!original?.size || !preview?.size) throw new Error("Please select both image files.");
      if (!original.type.startsWith("image/") || !preview.type.startsWith("image/")) throw new Error("Original and preview must be image files.");

      const p = await fetch("/api/admin/photos/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ originalName: original.name, originalType: original.type, previewName: preview.name, previewType: preview.type }),
      });
      const urls = await p.json();
      if (!p.ok) throw new Error(urls.error || "Presign failed");

      const uploads = await Promise.all([
        fetch(urls.original.url, { method: "PUT", headers: { "content-type": original.type }, body: original }),
        fetch(urls.preview.url, { method: "PUT", headers: { "content-type": preview.type }, body: preview }),
      ]);
      if (uploads.some(x => !x.ok)) throw new Error("One or more photo uploads failed. Please try again.");

      const c = await fetch("/api/admin/photos/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, priceCents: Math.round(Number(data.price) * 100), originalStorageKey: urls.original.key, previewStorageKey: urls.preview.key }),
      });
      const result = await c.json();
      if (!c.ok) throw new Error(result.error || "Could not save photo");
      r.push("/admin");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return <main className="container" style={{ padding: "45px 0", maxWidth: 760 }}><h1>Upload Original Photo</h1><form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 25 }} className="card"><div style={{ padding: 24, display: "grid", gap: 16 }}><div><label className="label">Title</label><input name="title" className="input" required /></div><div><label className="label">Category</label><input name="category" className="input" placeholder="Landscape" required /></div><div><label className="label">Price (USD)</label><input name="price" type="number" min="0.01" step="0.01" className="input" required /></div><div><label className="label">Description</label><textarea name="description" className="input" rows={4} /></div><div><label className="label">Original File</label><input name="original" type="file" accept="image/*" required /></div><div><label className="label">Preview / Watermarked File</label><input name="preview" type="file" accept="image/*" required /></div>{msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}<button className="btn btn-gold" disabled={busy}>{busy ? "Uploading…" : "Upload Photo"}</button></div></form></main>;
}
