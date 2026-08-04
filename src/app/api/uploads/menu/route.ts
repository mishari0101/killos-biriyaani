import { getSession } from "@/lib/auth/session";
import { imageStorage } from "@/lib/uploads/storage";
import { IMAGE_EXT_BY_MIME, MAX_IMAGE_SIZE, sniffImageType } from "@/lib/uploads/validate";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** Folders that accept uploads. Kept tight so the folder can't escape uploads/. */
const ALLOWED_FOLDERS = new Set(["menu", "gallery", "attractions", "reviews", "branches", "seo", "blog"]);

function resolveFolder(request: Request): string {
  const folder = new URL(request.url).searchParams.get("folder");
  if (folder && ALLOWED_FOLDERS.has(folder)) return folder;
  return "menu";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid upload payload." },
      { status: 400, headers: NO_STORE }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { ok: false, error: "Missing image file." },
      { status: 400, headers: NO_STORE }
    );
  }

  if (file.size <= 0) {
    return Response.json(
      { ok: false, error: "The selected file is empty." },
      { status: 422, headers: NO_STORE }
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { ok: false, error: "Images must be 5 MB or smaller." },
      { status: 422, headers: NO_STORE }
    );
  }

  const extension = IMAGE_EXT_BY_MIME[file.type];
  if (!extension) {
    return Response.json(
      { ok: false, error: "Only JPG, PNG, or WebP images are allowed." },
      { status: 422, headers: NO_STORE }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);
  if (sniffed !== file.type) {
    return Response.json(
      { ok: false, error: "The file is not a valid image." },
      { status: 422, headers: NO_STORE }
    );
  }

  try {
    const { url, key } = await imageStorage.save(resolveFolder(request), buffer, extension);
    return Response.json({ ok: true, url, key }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("POST /api/uploads/menu failed:", error);
    return Response.json(
      { ok: false, error: "Could not save the image." },
      { status: 500, headers: NO_STORE }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: NO_STORE });
  }

  const key = new URL(request.url).searchParams.get("key");
  if (!key) {
    return Response.json({ ok: false, error: "Missing key." }, { status: 400, headers: NO_STORE });
  }

  try {
    await imageStorage.delete(key);
    return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
  } catch (error) {
    console.error("DELETE /api/uploads/menu failed:", error);
    return Response.json(
      { ok: false, error: "Could not delete the image." },
      { status: 500, headers: NO_STORE }
    );
  }
}
