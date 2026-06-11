import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
 
export async function proxy(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);
 
	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
    matcher: [
      '/((?!api/auth|api/health|api/pwa-icon|login|signup|_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|serwist|~offline|icon|apple-icon|offline.html|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
}