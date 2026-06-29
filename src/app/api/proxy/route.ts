import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get("url");
  const download = searchParams.get("dl") === "true";

  if (!mediaUrl) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch content" }, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    const headers: Record<string, string> = { "Content-Type": contentType };

    if (download) {
      const fileName = mediaUrl.split("/").pop()?.split("?")[0] || "download";
      headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
    }

    if (contentType.startsWith("image/") || contentType.startsWith("video/") || contentType.startsWith("audio/")) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, { headers });
    }

    if (contentType.startsWith("text/html")) {
      const html = await response.text();
      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });

  } catch (error) {
    return NextResponse.json({ error: "Error fetching content" + error }, { status: 500 });
  }
}
