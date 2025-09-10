// lib/api/authService.ts
import { baseRequest } from './coreApiClient';
import { setAuthToken, clearAuthToken } from '../utils/cookieUtils';
import { LoginRequest, LoginResponse, ValidateAuthTokenResponse } from './apiTypes';

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        // Pass true for isLoginRequest to prevent sending an existing token
        const response = await baseRequest<LoginResponse>('/login', 'POST', data, false, true);
        if (response.token) {
            setAuthToken(response.token);
        }
        return response;
    },
    validateAuthToken: async (): Promise<ValidateAuthTokenResponse> => {
        return baseRequest<ValidateAuthTokenResponse>('/validate_auth_token', 'GET');
    },
    logout: (): void => { // Made synchronous as it only clears cookie
        clearAuthToken();
        // If backend had a /logout endpoint:
        // await baseRequest<void>('/logout', 'POST');
    },
};