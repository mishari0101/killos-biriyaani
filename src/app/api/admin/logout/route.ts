import { deleteSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST() {
  await deleteSession();
  return Response.json({ ok: true }, { status: 200, headers: NO_STORE });
}
