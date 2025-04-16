import formData from "form-data";
import Mailgun from "mailgun.js";
import { logger } from "@/lib/logger";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

const domain = process.env.MAILGUN_DOMAIN || "";
const fromEmail = `ViperHost <noreply@${domain}>`;

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  try {
    await mg.messages.create(domain, {
      from: fromEmail,
      to: email,
      subject: "Verify your ViperHost account",
      html: `
        <h1>Welcome to ViperHost!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    });

    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error("Failed to send verification email", { email, error });
    throw new Error("Failed to send verification email");
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await mg.messages.create(domain, {
      from: fromEmail,
      to: email,
      subject: "Welcome to ViperHost!",
      html: `
        <h1>Welcome to ViperHost, ${name}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Here are some tips to get started:</p>
        <ul>
          <li>Upload your first file</li>
          <li>Share your files with friends</li>
          <li>Explore our premium features</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
      `,
    });

    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error("Failed to send welcome email", { email, error });
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  try {
    await mg.messages.create(domain, {
      from: fromEmail,
      to: email,
      subject: "Reset your ViperHost password",
      html: `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset for your ViperHost account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error("Failed to send password reset email", { email, error });
    throw new Error("Failed to send password reset email");
  }
}
