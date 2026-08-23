export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Whether an image URL comes from one of our managed image hosts (Cloudinary
 * today, ImgBB for legacy records). These hosts already deliver optimized
 * images, so <Image> should bypass the Next.js optimizer for them. Local
 * `/uploads/...` URLs are intentionally excluded (the legacy route keeps them
 * handled as before).
 */
export function isManagedImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname;
    return (
      hostname === "res.cloudinary.com" ||
      hostname.endsWith(".res.cloudinary.com") ||
      hostname === "i.ibb.co" ||
      hostname === "ibb.co" ||
      hostname === "imgbb.com"
    );
  } catch {
    return false;
  }
}

/**
 * Upload an image file to the server and return the resulting URL.
 *
 * The UI only consumes the returned URL, so the storage backend
 * (local disk today, S3 later) can change without touching the UI.
 */
export async function uploadImage(file: File, folder = "menu"): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/uploads/menu?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body: formData,
  });
  const payload = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; key?: string; error?: string };

  if (!res.ok || !payload.ok || !payload.url || !payload.key) {
    throw new Error(payload?.error ?? "Upload failed. Please try again.");
  }

  return { url: payload.url, key: payload.key };
}

/** Upload with a determinate progress callback (0–100) via XMLHttpRequest. */
export function uploadImageWithProgress(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/uploads/menu?folder=${encodeURIComponent(folder)}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let payload: { ok?: boolean; url?: string; key?: string; error?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // fall through to the error path below
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload.ok && payload.url && payload.key) {
        resolve({ url: payload.url, key: payload.key });
      } else {
        reject(new Error(payload?.error ?? "Upload failed. Please try again."));
      }
    };

    xhr.onerror = () => reject(new Error("Could not reach the server. Please try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."));
    xhr.send(form);
  });
}

/** Best-effort removal of a previously uploaded file that was never saved. */
export async function deleteUploadedFile(key: string): Promise<void> {
  try {
    await fetch(`/api/uploads/menu?key=${encodeURIComponent(key)}`, { method: "DELETE" });
  } catch {
    // best effort
  }
}
