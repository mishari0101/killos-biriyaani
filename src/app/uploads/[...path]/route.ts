import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { MIME_BY_EXT, UPLOADS_ROOT } from "@/lib/uploads/storage";
import { sniffImageType } from "@/lib/uploads/validate";

export const dynamic = "force-dynamic";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Served assets dirs for /uploads/... URLs, tried in order.
 *
 * 1. `public/uploads/` — runtime uploads from the pre-ImgBB era (dev only;
 *    this folder is gitignored, so it never exists in production deploys).
 * 2. `public/images/` — committed static assets. New admin uploads live on
 *    ImgBB, so this fallback only exists so legacy /uploads/... URLs keep
 *    resolving after a git-based deployment without touching stored content.
 */
const LOCAL_ROOTS = [UPLOADS_ROOT, path.join(process.cwd(), "public", "images")];

/**
 * Serve files under `/uploads/...` URLs from the local asset roots.
 *
 * Next.js snapshots the `public/` directory once at server startup, so files
 * added at runtime are not visible to the static file server. This route reads
 * them from disk on demand (path-traversal guarded + sniffed).
 */
function resolveInRoot(root: string, ...segments: string[]): string | null {
  const parts = segments.flatMap((segment) => segment.split("/")).filter(Boolean);
  if (parts.some((part) => part === ".." || part.includes("\\") || part.includes(":"))) {
    return null;
  }
  const filename = parts.pop();
  if (!filename || !/^[a-zA-Z0-9-_.]+$/.test(filename)) return null;
  if (parts.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part))) return null;
  const target = path.join(root, ...parts, filename);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  for (const root of LOCAL_ROOTS) {
    const filePath = resolveInRoot(root, ...segments);
    if (!filePath) continue;

    try {
      const info = await stat(filePath);
      if (!info.isFile()) continue;
    } catch {
      continue;
    }

    const extension = path.extname(filePath).slice(1).toLowerCase();
    const contentType = MIME_BY_EXT[extension];
    if (!contentType) continue;

    try {
      const buffer = await readFile(filePath);
      if (sniffImageType(buffer) !== contentType) continue;
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": `public, max-age=${MAX_AGE_SECONDS}, immutable`,
        },
      });
    } catch {
      continue;
    }
  }

  return new Response("Not Found", { status: 404 });
}
