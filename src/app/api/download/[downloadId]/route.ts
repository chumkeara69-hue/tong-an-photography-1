```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ downloadId: string }> }
) {
  try {
    const { downloadId } = await params;

    const download = await prisma.download.findUnique({
      where: { id: downloadId },
      include: {
        orderItem: {
          include: {
            order: true,
            photo: true,
          },
        },
      },
    });

    if (!download) {
      return NextResponse.json(
        { error: "Download not found" },
        { status: 404 }
      );
    }

    if (download.orderItem.order.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "Payment is not verified." },
        { status: 403 }
      );
    }

    if (download.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Download link expired." },
        { status: 410 }
      );
    }

    if (download.downloadCount >= download.maxDownloads) {
      return NextResponse.json(
        { error: "Download limit reached." },
        { status: 429 }
      );
    }

    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: "S3 is not configured" },
        { status: 500 }
      );
    }

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const filename =
      download.orderItem.photo.title.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      ) + ".jpg";

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: download.orderItem.photo.originalStorageKey,
        ResponseContentDisposition: `attachment; filename="${filename}"`,
      }),
      { expiresIn: 300 }
    );

    await prisma.download.update({
      where: { id: download.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      { error: "Could not create download link." },
      { status: 500 }
    );
  }
}
```
