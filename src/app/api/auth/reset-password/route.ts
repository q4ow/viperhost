import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const verificationToken = await db.verificationToken.findUnique({
      where: {
        token,
      },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hashedPassword = await hash(password, 10);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await db.verificationToken.delete({
      where: {
        token,
      },
    });

    logger.info(`Password reset successful for: ${user.email}`);

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Password reset error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
