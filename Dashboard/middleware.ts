// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_TOKEN_COOKIE_NAME } from './lib/utils/cookieUtils'

export function middleware(req: NextRequest) {
    const token = req.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value
    const { pathname } = req.nextUrl

    // 1) If the user is _not_ logged in and tries to access anything under /dashboard → redirect to /
    if (!token && pathname.startsWith('/dashboard')) {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // 2) If the user _is_ logged in and tries to access “/” (your login page) → redirect to /dashboard
    if (token && pathname === '/') {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // 3) Otherwise, just continue — they either have permission, or are on an un-protected page
    return NextResponse.next()
}

// Only run this middleware on pages you care about:
export const config = {
    matcher: ['/', '/dashboard/:path*'],
}
