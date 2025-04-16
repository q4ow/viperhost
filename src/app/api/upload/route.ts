import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateFileId } from "@/lib/utils";
import {
  ensureDirectoryExists,
  getFileExtension,
  saveFile,
} from "@/lib/serverUtils";
import { logger } from "@/lib/logger";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPro = user.subscription?.status === "active";

    const maxSize = isPro ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the limit (${isPro ? "2GB" : "100MB"})` },
        { status: 400 },
      );
    }

    const fileId = await generateFileId();

    const originalFilename = file.name;
    const extension = getFileExtension(originalFilename);

    const uploadDir = path.join(process.cwd(), "uploads", user.uuid);
    await ensureDirectoryExists(uploadDir);

    const filename = `${fileId}${extension}`;
    const filePath = path.join(uploadDir, filename);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await saveFile(filePath, fileBuffer);

    const fileUrl = `${process.env.NEXTAUTH_URL}/${filename}`;
    const rawUrl = `${process.env.NEXTAUTH_URL}/${user.uuid}/${filename}`;

    const fileData = await db.file.create({
      data: {
        name: originalFilename,
        size: file.size,
        type: file.type,
        url: fileUrl,
        rawUrl: rawUrl,
        fileId,
        userId,
      },
    });

    logger.info(`File uploaded: ${fileData.id}`, {
      userId,
      fileId,
      filename: originalFilename,
      size: file.size,
    });

    return NextResponse.json(fileData, { status: 201 });
  } catch (error) {
    logger.error("File upload error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
