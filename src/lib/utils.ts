import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

export async function generateUUID(): Promise<string> {
  if (typeof window === "undefined") {
    const crypto = await import("crypto");
    return crypto.randomUUID();
  }
  return crypto.randomUUID();
}

export async function generateFileId(): Promise<string> {
  const array = new Uint8Array(4);
  if (typeof window === "undefined") {
    const crypto = await import("crypto");
    crypto.randomFillSync(array);
  } else {
    crypto.getRandomValues(array);
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
