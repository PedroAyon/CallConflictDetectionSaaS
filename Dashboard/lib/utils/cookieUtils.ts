// lib/utils/cookieUtils.ts
import Cookies from 'js-cookie';

export const AUTH_TOKEN_COOKIE_NAME = 'authToken';

export function getAuthToken(): string | undefined {
    return Cookies.get(AUTH_TOKEN_COOKIE_NAME);
}

export function setAuthToken(token: string): void {
    Cookies.set(AUTH_TOKEN_COOKIE_NAME, token, { expires: 30, path: '/' });
}

export function clearAuthToken(): void {
    Cookies.remove(AUTH_TOKEN_COOKIE_NAME, { path: '/' });
}

export function isLoggedIn(): boolean {
    return !!getAuthToken();
}