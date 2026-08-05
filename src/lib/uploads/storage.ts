import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StoredImage {
  url: string;
  key: string;
}

/**
 * Storage seam for uploaded images.
 *
 * The rest of the app (upload route + services) only ever works with the
 * returned `url` strings, so the backend can be swapped without touching UI.
 * This driver stores files on the local filesystem under `public/uploads/`
 * and returns relative `/uploads/...` URLs served by the app.
 */
export interface ImageStorage {
  save(folder: string, buffer: Buffer, extension: string): Promise<StoredImage>;
  delete(key: string): Promise<void>;
  /** Whether a URL points at an image we manage (as opposed to an external CDN). */
  isManagedUrl(url: string): boolean;
  /** Extract the storage key from a managed URL, or null when not managed. */
  urlToKey(url: string): string | null;
}

/** Absolute path of the local uploads root (`<cwd>/public/uploads`). */
export const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const PUBLIC_URL_PREFIX = "/uploads/";
const FOLDER_RE = /^[a-zA-Z0-9_-]+$/;
const KEY_RE = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9-_.]+$/;

/** Resolve a storage key to an absolute path inside UPLOADS_ROOT, or null. */
function resolveWithinRoot(key: string): string | null {
  if (!key || key.includes("\\") || key.includes("..")) return null;
  const normalized = path.normalize(key);
  if (normalized.startsWith("/") || normalized.startsWith("..")) return null;
  const target = path.join(UPLOADS_ROOT, normalized);
  if (target !== UPLOADS_ROOT && !target.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return target;
}

function localImageStorage(): ImageStorage {
  return {
    async save(folder, buffer, extension) {
      if (!FOLDER_RE.test(folder)) {
        throw new Error(`Invalid upload folder: ${folder}`);
      }
      if (!MIME_BY_EXT[extension]) {
        throw new Error(`Unsupported image extension: ${extension}`);
      }
      const filename = `${Date.now()}-${randomUUID().slice(0, 12)}.${extension}`;
      const dir = path.join(UPLOADS_ROOT, folder);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, filename), buffer);
      const key = `${folder}/${filename}`;
      return { url: PUBLIC_URL_PREFIX + key, key };
    },

    async delete(key) {
      if (!KEY_RE.test(key)) return;
      const target = resolveWithinRoot(key);
      if (!target) return;
      await rm(target, { force: true });
    },

    isManagedUrl(url) {
      return url.startsWith(PUBLIC_URL_PREFIX);
    },

    urlToKey(url) {
      if (!url.startsWith(PUBLIC_URL_PREFIX)) return null;
      const key = url.slice(PUBLIC_URL_PREFIX.length).split("?")[0];
      if (!key || !KEY_RE.test(key)) return null;
      return key;
    },
  };
}

export const imageStorage: ImageStorage = localImageStorage();
