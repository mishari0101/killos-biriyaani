export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Identify the real image type from magic bytes (not the declared MIME). */
export function sniffImageType(buffer: Uint8Array): string | null {
  if (buffer.length < 12) return null;
  const b = buffer;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const riff = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
  const webp = b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  if (riff && webp) return "image/webp";
  return null;
}

/** Client-side check before upload (type + size). */
export function validateImageFileClient(file: { type: string; size: number }): string | null {
  if (!IMAGE_EXT_BY_MIME[file.type]) return "Only JPG, PNG, or WebP images are allowed.";
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > MAX_IMAGE_SIZE) return "Image is too large (max 5 MB).";
  return null;
}
