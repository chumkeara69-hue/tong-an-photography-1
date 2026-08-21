```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const photos = await prisma.photo.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return NextResponse.json(
    photos.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      category: p.category.name,
      priceCents: p.priceCents,
      description: p.description,
      previewStorageKey: p.previewStorageKey,
    }))
  );
}
```
