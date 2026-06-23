import { NextRequest, NextResponse } from "next/server";
import { uploadBase64ToCloudinary } from "@/lib/cloudinary";

// Use an API route to bypass Next.js Server Action Turbopack streaming bugs completely
export async function POST(req: NextRequest) {
  try {
    const { base64, folder } = await req.json();
    
    if (!base64) {
      return NextResponse.json({ error: "No base64 image provided" }, { status: 400 });
    }

    const url = await uploadBase64ToCloudinary(base64, folder || "uploads");
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
