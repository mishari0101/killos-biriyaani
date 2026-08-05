import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { MIME_BY_EXT, UPLOADS_ROOT } from "@/lib/uploads/storage";
import { sniffImageType } from "@/lib/uploads/validate";

export const dynamic = "force-dynamic";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Serve files from `public/uploads/` under their `/uploads/...` URLs.
 *
 * Next.js snapshots the `public/` directory once at server startup, so files
 * uploaded at runtime are not visible to the static file server. This route
 * reads them from disk on demand (path-traversal guarded + sniffed).
 */
function resolveFile(...segments: string[]): string | null {
  const parts = segments.flatMap((segment) => segment.split("/")).filter(Boolean);
  if (parts.some((part) => part === ".." || part.includes("\\") || part.includes(":"))) {
    return null;
  }
  const filename = parts.pop();
  if (!filename || !/^[a-zA-Z0-9-_.]+$/.test(filename)) return null;
  if (parts.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) return null;
  const target = path.join(UPLOADS_ROOT, ...parts, filename);
  if (target !== UPLOADS_ROOT && !target.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return target;
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const filePath = resolveFile(...segments);
  if (!filePath) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new Response("Not Found", { status: 404 });
    }
  } catch {
    return new Response("Not Found", { status: 404 });
  }

  const extension = path.extname(filePath).slice(1).toLowerCase();
  const contentType = MIME_BY_EXT[extension];
  if (!contentType) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const buffer = await readFile(filePath);
    if (sniffImageType(buffer) !== contentType) {
      return new Response("Not Found", { status: 404 });
    }
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${MAX_AGE_SECONDS}, immutable`,
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}
