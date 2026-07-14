import { NextResponse } from "next/server";
// Change this line to look inside your new shared/services folder:
import { generatePresignedUploadUrl } from "@/shared/services/s3Service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const contentType = searchParams.get("contentType");

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "Missing required filename or contentType query parameters." },
      { status: 400 },
    );
  }

  try {
    const uploadTicket = await generatePresignedUploadUrl(
      filename,
      contentType,
    );

    return NextResponse.json(uploadTicket);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal shared infrastructure failure constructing tokens." },
      { status: 500 },
    );
  }
}
