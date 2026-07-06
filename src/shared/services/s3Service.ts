import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PresignedUrlResponse } from "@/shared/types/upload";

// This is isolated inside the shared layer and only executes on the server side
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generates a secure, temporary cloud asset transfer ticket link.
 */
export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string,
): Promise<PresignedUrlResponse> {
  const fileKey = `merchants/catalog/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  });

  // Ticket expires safely in 5 minutes (300 seconds)
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
  });

  return { url: presignedUrl, fileKey };
}
