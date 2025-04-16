import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { logger } from "@/lib/logger"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { uuid: string; filename: string } }) {
  try {
    const { uuid, filename } = params

    const user = await db.user.findUnique({
      where: { uuid },
      include: {
        files: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const file = user.files.find(f => f.fileId === filename)

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), "uploads", uuid, filename)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const stats = fs.statSync(filePath)

    const fileBuffer = fs.readFileSync(filePath)

    const ext = path.extname(filename).toLowerCase()
    let contentType = "application/octet-stream"

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg"
        break
      case ".png":
        contentType = "image/png"
        break
      case ".gif":
        contentType = "image/gif"
        break
      case ".pdf":
        contentType = "application/pdf"
        break
      case ".mp4":
        contentType = "video/mp4"
        break
      case ".mp3":
        contentType = "audio/mpeg"
        break
      case ".txt":
        contentType = "text/plain"
        break
      case ".html":
        contentType = "text/html"
        break
      case ".css":
        contentType = "text/css"
        break
      case ".js":
        contentType = "application/javascript"
        break
      case ".json":
        contentType = "application/json"
        break
      case ".zip":
        contentType = "application/zip"
        break
    }

    logger.info(`File accessed: ${filename}`, {
      uuid,
      filename,
      size: stats.size,
      userId: user.id,
      fileId: file.id
    })

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `inline; filename="${file.name}"`,
      },
    })
  } catch (error) {
    logger.error("File access error", { error })
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
