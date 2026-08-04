import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ ok: false }, { status: 401, headers: NO_STORE });
  }
  return Response.json(
    {
      ok: true,
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    },
    { status: 200, headers: NO_STORE }
  );
}
