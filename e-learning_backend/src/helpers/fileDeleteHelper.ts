import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * Delete a file from disk by its URL path.
 * Handles URLs like "/uploads/folder/file.jpg"
 */
export function deleteFileFromDisk(url: string): void {
  try {
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    const fullPath = join(process.cwd(), cleanPath);

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  } catch {
    // Silently fail - file may already be deleted
  }
}
