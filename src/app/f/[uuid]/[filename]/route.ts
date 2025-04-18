import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { filename: string } },
) {
  try {
    const { filename } = params;
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "true";

    const shareLink = await db.shareLink.findFirst({
      where: {
        file: {
          fileId: filename.split(".")[0],
        },
      },
      include: {
        file: true,
        user: true,
      },
    });

    let file;
    let user;

    if (shareLink) {
      if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Share link has expired" },
          { status: 410 },
        );
      }

      file = shareLink.file;
      user = shareLink.user;

      await db.shareLink.update({
        where: { id: shareLink.id },
        data: {
          views: { increment: isDownload ? 0 : 1 },
          downloads: { increment: isDownload ? 1 : 0 },
        },
      });
    } else {
      file = await db.file.findFirst({
        where: { fileId: filename.split(".")[0] },
        include: { user: true },
      });

      if (!file) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      user = file.user;

      const activeShareLink = await db.shareLink.findFirst({
        where: {
          fileId: file.id,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (activeShareLink) {
        await db.shareLink.update({
          where: { id: activeShareLink.id },
          data: {
            views: { increment: isDownload ? 0 : 1 },
            downloads: { increment: isDownload ? 1 : 0 },
          },
        });
      }
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      user.uuid,
      `${file.fileId}${path.extname(file.name)}`,
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    const ext = path.extname(file.name).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".mp4":
        contentType = "video/mp4";
        break;
      case ".mp3":
        contentType = "audio/mpeg";
        break;
      case ".txt":
        contentType = "text/plain";
        break;
      case ".html":
        contentType = "text/html";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".js":
        contentType = "application/javascript";
        break;
      case ".json":
        contentType = "application/json";
        break;
      case ".zip":
        contentType = "application/zip";
        break;
    }

    logger.info(`File ${isDownload ? "downloaded" : "viewed"}: ${filename}`, {
      filename: file.name,
      size: stats.size,
      userId: user.id,
      fileId: file.id,
      shareId: shareLink?.id,
      isDownload,
    });

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${file.name}"`,
      },
    });
  } catch (error) {
    logger.error("File access error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
