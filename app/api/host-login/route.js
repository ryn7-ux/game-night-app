import { NextResponse } from "next/server";

export async function POST(request) {
    const { pin } = await request.json();
    const correctPin = process.env.HOST_PIN;
    const token = process.env.HOST_SESSION_TOKEN;

  if (!correctPin || pin !== correctPin) {
        return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
    res.cookies.set("gamenight_host_auth", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 12,
    });
    return res;
}
