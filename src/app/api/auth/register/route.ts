import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { generateUUID } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mail";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password, username } = await req.json();

    const email = rawEmail.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const uuid = await generateUUID();

    await db.user.create({
      data: {
        email,
        name: username,
        password: hashedPassword,
        uuid,
      },
    });

    /* const verificationToken = await db.verificationToken.create({
      data: {
        identifier: email,
        token: await generateUUID(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, verificationToken.token); */

    logger.info(`User registered: ${email}`);

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
  } catch (error) {
    logger.error("Registration error", { error });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
