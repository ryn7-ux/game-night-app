import { NextResponse } from "next/server";

export function middleware(request) {
    const cookie = request.cookies.get("gamenight_host_auth")?.value;
    const valid = cookie && cookie === process.env.HOST_SESSION_TOKEN;

  if (!valid) {
        const url = request.nextUrl.clone();
        url.pathname = "/host-login";
        return NextResponse.redirect(url);
  }
    return NextResponse.next();
}

export const config = {
    matcher: ["/host"],
};
