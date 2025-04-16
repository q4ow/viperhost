import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: { uuid: string; filename: string } },
) {
    try {
        const { uuid, filename } = params;

        const file = await db.file.findFirst({
            where: {
                AND: [
                    { rawUrl: filename },
                    { fileId: uuid }
                ]
            },
            include: { user: true },
        });

        if (!file) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const shareLink = await db.shareLink.findFirst({
            where: {
                fileId: file.id,
            },
            include: {
                user: true,
            },
        });

        if (shareLink) {
            if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
                return NextResponse.json(
                    { error: "Share link has expired" },
                    { status: 410 },
                );
            }

            await db.shareLink.update({
                where: { id: shareLink.id },
                data: { views: { increment: 1 } },
            });
        }

        const filePath = path.join(
            process.cwd(),
            "uploads",
            uuid,
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

        logger.info(`File accessed: ${filename}`, {
            filename: file.name,
            size: stats.size,
            userId: file.user.id,
            fileId: file.id,
            shareId: shareLink?.id,
        });

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": stats.size.toString(),
                "Content-Disposition": `inline; filename="${file.name}"`,
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
