import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get("url");

  if (!mediaUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }
  
  // Decode the URL
//   mediaUrl = decodeURIComponent(mediaUrl);

  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch content" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    
    // Handle image content
    if (contentType.startsWith("image/")) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentType },
      });
    }

    // Handle video content
    if (contentType.startsWith("video/")) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentType },
      });
    }
    // Handle video content
    if (contentType.startsWith("source/")) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentType },
      });
    }

    // Handle audio content
    if (contentType.startsWith("audio/")) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: { "Content-Type": contentType },
      });
    }

    // Handle iframe content (HTML)
    if (contentType.startsWith("text/html")) {
      const html = await response.text();
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Default case: unsupported media type
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });

  } catch (error) {
    return NextResponse.json({ error: "Error fetching content" + error }, { status: 500 });
  }
}
