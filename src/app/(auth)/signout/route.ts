// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Await cookies helper in Next.js 15
    const cookieStore = await cookies();

    // Delete the session cookie directly
    cookieStore.delete("session_token");

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }, // Explicitly return a 200 OK status
    );
  } catch (error) {
    console.error("Backend error during signout route:", error);
    return NextResponse.json(
      { success: false, error: "Signout failed" },
      { status: 500 },
    );
  }
}
