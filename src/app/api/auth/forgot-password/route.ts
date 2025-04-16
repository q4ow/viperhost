import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateUUID } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/mail";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json(
        { message: "If your email exists, you will receive a reset link" },
        { status: 200 },
      );
    }

    const resetToken = await db.verificationToken.create({
      data: {
        identifier: email,
        token: await generateUUID(),
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, resetToken.token);

    logger.info(`Password reset email sent to: ${email}`);

    return NextResponse.json(
      { message: "If your email exists, you will receive a reset link" },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Password reset request error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
