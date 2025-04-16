import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: fileId } = params;

        const file = await db.file.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const urlPath = new URL(file.url).pathname;
        const filePath = path.join(process.cwd(), urlPath);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File missing on server" }, { status: 404 });
        }

        const fileStream = fs.createReadStream(filePath);

        const headers = new Headers();
        headers.set("Content-Type", file.type || "application/octet-stream");
        headers.set(
            "Content-Disposition",
            `inline; filename="${encodeURIComponent(file.name)}"`
        );

        return new Response(fileStream as any, {
            status: 200,
            headers,
        });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}