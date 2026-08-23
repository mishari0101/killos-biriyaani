import "server-only";

import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

export interface StoredImage {
  url: string;
  key: string;
}

/** Base error for image storage failures so callers can surface the real cause. */
export class ImageStorageError extends Error {}

/** The image host is not configured (e.g. CLOUDINARY_* missing). */
export class ImageStorageConfigError extends ImageStorageError {}

/** The image host rejected the upload or delete request. */
export class ImageStorageHostError extends ImageStorageError {}

/** The image host did not answer in time. */
export class ImageStorageTimeoutError extends ImageStorageError {}

/** The image host could not be reached (DNS/connection failure). */
export class ImageStorageNetworkError extends ImageStorageError {}

/** Normalize an underlying fetch/network failure into a typed storage error. */
function toStorageError(error: unknown): ImageStorageError {
  const name = (error as { name?: string })?.name ?? "";
  const code =
    ((error as { code?: string })?.code ?? "") ||
    ((error as { cause?: { code?: string } })?.cause?.code ?? "");
  if (name === "TimeoutError" || name === "AbortError" || code === "ETIMEDOUT") {
    return new ImageStorageTimeoutError(
      "The image host timed out. Please try again."
    );
  }
  if (
    name === "TypeError" ||
    /^(ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ENETUNREACH|EHOSTUNREACH)$/.test(code)
  ) {
    return new ImageStorageNetworkError(
      "Could not reach the image host. Check the server's outbound network access."
    );
  }
  return new ImageStorageNetworkError("The image host request failed. Please try again.");
}

/**
 * Storage seam for uploaded images.
 *
 * The rest of the app (upload route + services) only ever works with the
 * returned `url` strings, so the backend can be swapped without touching UI.
 *
 * New images are uploaded to Cloudinary using the server-side
 * CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET. The
 * returned `key` is Cloudinary's `public_id`, which the UI uses to remove
 * uploads that were never saved to Firestore (DELETE /api/uploads/menu?key=...)
 * and which services recover from stored URLs via `urlToKey`. Images uploaded
 * before the ImgBB migration live on the local filesystem under
 * public/uploads/; they are still served by src/app/uploads/[...path] and are
 * cleaned up when their entity is deleted or the image is replaced, so existing
 * data keeps working unchanged. Images hosted on ImgBB (from the previous
 * migration) keep serving as-is until they are eventually replaced.
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
const CLOUDINARY_HOSTS = new Set(["res.cloudinary.com"]);

/**
 * Cloudinary public_ids we generate carry a `cld-` prefix on the filename so a
 * delete key is unambiguously a Cloudinary asset (never a local file key).
 */
const CLOUDINARY_KEY_PREFIX = "cld-";
const CLOUDINARY_KEY_RE = new RegExp(
  `^[a-zA-Z0-9_-]+\\/${CLOUDINARY_KEY_PREFIX}[a-zA-Z0-9_-]+$`
);

const IMGBB_DELETE_ENDPOINT = "https://ibb.co/json";
const IMGBB_REQUEST_TIMEOUT_MS = 60_000;

/** Read an env value the way the rest of the app does (trim + strip quotes). */
function readEnv(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

/**
 * Validate the Cloudinary credentials and (re)apply them to the SDK.
 * Throws ImageStorageConfigError when any credential is missing.
 */
function cloudinaryConfig(): void {
  const cloudName = readEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = readEnv("CLOUDINARY_API_KEY");
  const apiSecret = readEnv("CLOUDINARY_API_SECRET");
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ImageStorageConfigError(
      "Cloudinary is not configured on this server (CLOUDINARY_CLOUD_NAME, " +
        "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required)."
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/** Map a Cloudinary SDK failure into a typed storage error. */
function toCloudinaryError(error: unknown): ImageStorageError {
  const httpCode = (error as { http_code?: number })?.http_code;
  if (typeof httpCode === "number" && httpCode >= 400) {
    const message = (error as { message?: string })?.message;
    return new ImageStorageHostError(
      message && message.trim() ? message : `Cloudinary returned HTTP ${httpCode}.`
    );
  }
  return toStorageError(error);
}

/** Upload a buffer to Cloudinary, returning the secure URL and public_id. */
function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const publicId = `${CLOUDINARY_KEY_PREFIX}${Date.now()}-${randomUUID().slice(0, 8)}`;
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(toCloudinaryError(error));
          return;
        }
        if (!result?.secure_url || !result?.public_id) {
          reject(new ImageStorageHostError("Cloudinary did not return an image URL."));
          return;
        }
        resolve({ url: result.secure_url, key: result.public_id });
      }
    );
    stream.on("error", (error) => reject(toCloudinaryError(error)));
    stream.end(buffer);
  });
}

/** Best-effort removal of an image on Cloudinary (never fails the caller). */
async function destroyOnCloudinary(publicId: string): Promise<void> {
  try {
    cloudinaryConfig();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Cloudinary destroy failed:", error);
  }
}

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
  const apiKey = readEnv("IMGBB_API_KEY");
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

/**
 * Extract a Cloudinary `public_id` from a delivery URL such as
 * `https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>.<ext>`
 * or `https://<cloud>.res.cloudinary.com/image/upload/v<version>/<public_id>.<ext>`.
 * Returns null for any other URL.
 */
function cloudinaryPublicIdFromUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const hostname = url.hostname;
  const isStandard = hostname === "res.cloudinary.com";
  const isCname = hostname.endsWith(".res.cloudinary.com");
  if (!isStandard && !isCname) return null;

  const parts = url.pathname.split("/").filter(Boolean);
  if (isStandard) parts.shift(); // drop the cloud name segment
  if (parts[0] !== "image" || parts[1] !== "upload") return null;
  const asset = parts.slice(2);
  if (asset.length === 0) return null;

  // Drop an optional version segment (`v<digits>`), taking the one closest to
  // the filename so transformed URLs (extra segments before the version) still
  // resolve to the right public_id.
  let versionIndex = -1;
  for (let i = asset.length - 1; i >= 0; i -= 1) {
    if (/^v\d+$/.test(asset[i])) {
      versionIndex = i;
      break;
    }
  }
  const afterVersion = versionIndex >= 0 ? asset.slice(versionIndex + 1) : asset;
  if (afterVersion.length === 0) return null;

  const filename = afterVersion[afterVersion.length - 1].replace(
    /\.(jpg|jpeg|png|webp)$/i,
    ""
  );
  const publicId = [...afterVersion.slice(0, -1), filename].join("/");
  if (!publicId) return null;
  if (!/^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/.test(publicId)) return null;
  return publicId;
}

function cloudinaryImageStorage(): ImageStorage {
  return {
    async save(folder, buffer, extension) {
      if (!FOLDER_RE.test(folder)) {
        throw new Error(`Invalid upload folder: ${folder}`);
      }
      if (!MIME_BY_EXT[extension]) {
        throw new Error(`Unsupported image extension: ${extension}`);
      }
      try {
        cloudinaryConfig();
      } catch (error) {
        if (error instanceof ImageStorageError) throw error;
        throw new ImageStorageConfigError("Cloudinary is not configured on this server.");
      }
      return uploadToCloudinary(buffer, folder);
    },

    async delete(key) {
      if (!key) return;
      if (parseImgbbDeleteUrl(key)) {
        await deleteFromImgbb(key);
        return;
      }
      if (CLOUDINARY_KEY_RE.test(key)) {
        await destroyOnCloudinary(key);
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
        const hostname = new URL(url).hostname;
        return (
          CLOUDINARY_HOSTS.has(hostname) ||
          hostname.endsWith(".res.cloudinary.com") ||
          IMGBB_HOSTS.has(hostname)
        );
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
      return cloudinaryPublicIdFromUrl(url);
    },
  };
}

export const imageStorage: ImageStorage = cloudinaryImageStorage();
