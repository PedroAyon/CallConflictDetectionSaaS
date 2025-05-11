// lib/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { LoginRequest, UserPayload, ApiErrorResponse } from '../api/apiTypes';
import { isLoggedIn as checkCookieLoggedIn } from '../utils/cookieUtils';

interface AuthState {
    isLoggedIn: boolean;
    user: UserPayload | null;
    isLoading: boolean;
    error: string | null;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isLoggedIn: checkCookieLoggedIn(),
        user: null, // Could try to load this from a secure cookie/localStorage if persisted
        isLoading: false,
        error: null,
    });

    const login = useCallback(async (credentials: LoginRequest) => {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await api.auth.login(credentials);
            // Optionally, fetch user details or validate token here to get UserPayload
            // For now, just update isLoggedIn state
            const validTokenRes = await api.auth.validateAuthToken();
            setAuthState({
                isLoggedIn: true,
                user: validTokenRes.user_payload,
                isLoading: false,
                error: null
            });
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setAuthState({
                isLoggedIn: false,
                user: null,
                isLoading: false,
                error: apiError.error + (apiError.details ? `: ${apiError.details}` : '')
            });
            throw err; // Re-throw to allow page-level handling if needed
        }
    }, []);

    const logout = useCallback(() => {
        api.auth.logout();
        setAuthState({ isLoggedIn: false, user: null, isLoading: false, error: null });
    }, []);

    // Optional: validate token on mount if already logged in via cookie
    useEffect(() => {
        const validate = async () => {
            if (checkCookieLoggedIn() && !authState.user) { // only if cookie exists but no user data yet
                setAuthState(prev => ({ ...prev, isLoading: true }));
                try {
                    const validTokenRes = await api.auth.validateAuthToken();
                    setAuthState({ isLoggedIn: true, user: validTokenRes.user_payload, isLoading: false, error: null });
                } catch (error) {
                    // Token might be invalid or expired, log out
                    api.auth.logout(); // Clear bad cookie
                    setAuthState({ isLoggedIn: false, user: null, isLoading: false, error: 'Session expired. Please log in again.' });
                }
            } else if (!checkCookieLoggedIn()) {
                setAuthState({ isLoggedIn: false, user: null, isLoading: false, error: null });
            }
        };
        validate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    return { ...authState, login, logout };
}