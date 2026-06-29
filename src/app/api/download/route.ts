import { NextRequest, NextResponse } from "next/server";
import { ZipArchive } from "archiver";

export async function POST(req: NextRequest) {
  try {
    const { urls, folderName = "assets-downloader" } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const archive = new ZipArchive({ zlib: { level: 6 } });

    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    const done = new Promise<void>((resolve, reject) => {
      archive.on("end", () => resolve());
      archive.on("error", (err) => reject(err));
    });

    await Promise.allSettled(
      urls.map(async (url: string) => {
        try {
          const response = await fetch(url);
          if (!response.ok) return;
          const buffer = await response.arrayBuffer();
          const fileName = url.split("/").pop()?.split("?")[0] || "file";
          archive.append(Buffer.from(buffer), { name: fileName });
        } catch {
          console.error(`Failed to download: ${url}`);
        }
      })
    );

    await archive.finalize();
    await done;

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${folderName}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error creating zip:", error);
    return NextResponse.json({ error: "Failed to create archive" }, { status: 500 });
  }
}
