import "server-only";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface StoredImage {
  url: string;
  key: string;
}

/**
 * Storage seam for uploaded images.
 *
 * The rest of the app (menu UI + menu service) only ever works with the
 * returned `url` strings, so the local implementation below can later be
 * replaced by an S3-compatible one (implement the same `ImageStorage`
 * interface and swap the factory) without touching any UI.
 */
export interface ImageStorage {
  save(folder: string, buffer: Buffer, extension: string): Promise<StoredImage>;
  delete(key: string): Promise<void>;
  /** Whether a URL points at an image we manage (as opposed to an external CDN). */
  isManagedUrl(url: string): boolean;
  /** Extract the storage key from a managed URL, or null when not managed. */
  urlToKey(url: string): string | null;
}

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

/** Public URL prefix for served uploads (route handler in app/api/uploads/file). */
const UPLOADS_URL_PREFIX = "/api/uploads/file/";

function localImageStorage(): ImageStorage {
  return {
    async save(folder, buffer, extension) {
      const dir = path.join(UPLOADS_ROOT, folder);
      await mkdir(dir, { recursive: true });
      const name = `${Date.now()}-${randomUUID().slice(0, 12)}.${extension}`;
      const key = `${folder}/${name}`;
      await writeFile(path.join(dir, name), buffer);
      return { url: `${UPLOADS_URL_PREFIX}${key}`, key };
    },

    async delete(key) {
      const normalized = path.normalize(key);
      if (normalized.startsWith("..") || path.isAbsolute(normalized)) return;
      const filePath = path.join(UPLOADS_ROOT, normalized);
      await unlink(filePath).catch(() => {});
    },

    isManagedUrl(url) {
      return url.startsWith(UPLOADS_URL_PREFIX);
    },

    urlToKey(url) {
      if (!url.startsWith(UPLOADS_URL_PREFIX)) return null;
      return url.slice(UPLOADS_URL_PREFIX.length);
    },
  };
}

// Swap this factory (e.g. env-driven S3 driver) to change storage backends.
export const imageStorage: ImageStorage = localImageStorage();
