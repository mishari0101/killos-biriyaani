import "server-only";

import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
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
 *
 * New images are uploaded to ImgBB (https://imgbb.com) using the server-side
 * IMGBB_API_KEY. The returned `key` is ImgBB's per-image delete URL, which the
 * UI uses to remove uploads that were never saved to Firestore (DELETE
 * /api/uploads/menu?key=...). Images uploaded before this migration live on
 * the local filesystem under public/uploads/; they are still served by
 * src/app/uploads/[...path] and are cleaned up when their entity is deleted or
 * the image is replaced, so existing data keeps working unchanged.
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

const FOLDER_RE = /^[a-zA-Z0-9_-]+$/;
const LOCAL_KEY_RE = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9-_.]+$/;
const LOCAL_URL_PREFIX = "/uploads/";
const IMGBB_HOSTS = new Set(["i.ibb.co", "ibb.co", "imgbb.com"]);

const IMGBB_UPLOAD_ENDPOINT = "https://api.imgbb.com/1/upload";
const IMGBB_DELETE_ENDPOINT = "https://ibb.co/json";
const IMGBB_REQUEST_TIMEOUT_MS = 30_000;

/** Resolve a local storage key to an absolute path inside UPLOADS_ROOT, or null. */
function resolveWithinRoot(key: string): string | null {
  if (!key || key.includes("\\") || key.includes("..")) return null;
  const normalized = path.normalize(key);
  if (normalized.startsWith("/") || normalized.startsWith("..")) return null;
  const target = path.join(UPLOADS_ROOT, normalized);
  if (target !== UPLOADS_ROOT && !target.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return target;
}

/** Parse an ImgBB delete URL (`https://ibb.co/<image_id>/<delete_hash>`). */
function parseImgbbDeleteUrl(value: string): { id: string; hash: string } | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!IMGBB_HOSTS.has(url.hostname)) return null;
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const hash = segments[segments.length - 1];
  const id = segments[segments.length - 2];
  if (!id || !hash) return null;
  if (!/^[a-zA-Z0-9]+$/.test(id) || !/^[a-zA-Z0-9]+$/.test(hash)) return null;
  return { id, hash };
}

/**
 * Best-effort removal of an image on ImgBB.
 *
 * ImgBB has no official delete endpoint. This mirrors the request their
 * delete page sends (`https://ibb.co/json`); it is best-effort and never
 * fails the calling operation.
 */
async function deleteFromImgbb(deleteUrl: string): Promise<void> {
  const parsed = parseImgbbDeleteUrl(deleteUrl);
  if (!parsed) return;
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) return;

  const body = new URLSearchParams();
  body.set("auth_token", apiKey);
  body.set("pathname", `/${parsed.id}/${parsed.hash}`);
  body.set("action", "delete");
  body.set("delete", "image");
  body.set("from", "resource");
  body.set("deleting[id]", parsed.id);
  body.set("deleting[type]", "image");
  body.set("deleting[privacy]", "public");
  body.set("deleting[hash]", parsed.hash);

  try {
    await fetch(IMGBB_DELETE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(IMGBB_REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Best effort — image cleanup must never break the entity operation.
  }
}

function imgbbImageStorage(): ImageStorage {
  return {
    async save(folder, buffer, extension) {
      if (!FOLDER_RE.test(folder)) {
        throw new Error(`Invalid upload folder: ${folder}`);
      }
      if (!MIME_BY_EXT[extension]) {
        throw new Error(`Unsupported image extension: ${extension}`);
      }
      const apiKey = process.env.IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error("ImgBB is not configured. Set IMGBB_API_KEY in the server environment.");
      }

      const form = new FormData();
      form.set("key", apiKey);
      form.set("image", buffer.toString("base64"));
      form.set("name", `${folder}-${Date.now()}-${randomUUID().slice(0, 8)}`);

      const res = await fetch(IMGBB_UPLOAD_ENDPOINT, {
        method: "POST",
        body: form,
        signal: AbortSignal.timeout(IMGBB_REQUEST_TIMEOUT_MS),
      });
      const payload = (await res.json().catch(() => null)) as {
        data?: { url?: string; delete_url?: string };
        error?: { message?: string };
        success?: boolean;
      } | null;

      if (!res.ok || !payload?.success || !payload.data?.url || !payload.data.delete_url) {
        throw new Error(payload?.error?.message ?? "ImgBB upload failed.");
      }

      return { url: payload.data.url, key: payload.data.delete_url };
    },

    async delete(key) {
      if (!key) return;
      if (parseImgbbDeleteUrl(key)) {
        await deleteFromImgbb(key);
        return;
      }
      if (!LOCAL_KEY_RE.test(key)) return;
      const target = resolveWithinRoot(key);
      if (!target) return;
      await rm(target, { force: true });
    },

    isManagedUrl(url) {
      if (url.startsWith(LOCAL_URL_PREFIX)) return true;
      try {
        return IMGBB_HOSTS.has(new URL(url).hostname);
      } catch {
        return false;
      }
    },

    urlToKey(url) {
      if (url.startsWith(LOCAL_URL_PREFIX)) {
        const key = url.slice(LOCAL_URL_PREFIX.length).split("?")[0];
        if (!key || !LOCAL_KEY_RE.test(key)) return null;
        return key;
      }
      return null;
    },
  };
}

export const imageStorage: ImageStorage = imgbbImageStorage();
