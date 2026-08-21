import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient() {
  if (!process.env.AWS_REGION || !process.env.S3_BUCKET) {
    throw new Error("S3 storage is not configured. Set AWS_REGION and S3_BUCKET.");
  }
  return new S3Client({ region: process.env.AWS_REGION });
}

export async function createUploadUrl(key: string, contentType: string) {
  if (process.env.STORAGE_PROVIDER !== "s3") {
    throw new Error("S3 storage is required for production uploads.");
  }
  if (!contentType) throw new Error("Content type is required.");
  const client = getClient();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: process.env.S3_SSE === "AES256" ? "AES256" : undefined,
    }),
    { expiresIn: 900 },
  );
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ServerSideEncryption: process.env.S3_SSE === "AES256" ? "AES256" : undefined,
    }),
  );
}
