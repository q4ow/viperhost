import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { extname } from "path";
import { logger } from "@/lib/logger";

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
    logger.info(`Created directory: ${dirPath}`);
  }
}

export function getFileExtension(filename: string): string {
  return extname(filename).toLowerCase();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function isValidFileType(
  filename: string,
  allowedTypes: string[],
): boolean {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
}

export async function saveFile(filepath: string, data: Buffer): Promise<void> {
  await writeFile(filepath, data);
}
