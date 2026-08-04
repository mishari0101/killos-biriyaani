import { readFile } from "node:fs/promises";
import path from "node:path";
import { sniffImageType } from "@/lib/uploads/validate";

export const dynamic = "force-dynamic";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const NO_STORE = { "Cache-Control": "private, max-age=0, no-store" };
const LONG_CACHE = { "Cache-Control": "public, max-age=31536000, immutable" };

/**
 * Serves uploaded files from public/uploads.
 *
 * `next start` only serves public files present at startup, so images uploaded
 * at runtime must be streamed through a route handler. Keeping the URL opaque
 * to the menu UI means a future S3 driver can return its own URL instead.
 */
export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await context.params;
  if (!segments.length) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  const key = segments.join(path.sep);
  const normalized = path.normalize(key);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  const filePath = path.join(UPLOADS_ROOT, normalized);
  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  const mime = sniffImageType(buffer);
  if (!mime) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(buffer.length),
      ...LONG_CACHE,
    },
  });
}
