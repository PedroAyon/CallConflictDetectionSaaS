// lib/api/coreApiClient.ts
import {getAuthToken} from '../utils/cookieUtils';
import {ApiErrorResponse} from './apiTypes';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function baseRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any,
    isBlobResponse: boolean = false,
    isLoginRequest: boolean = false
): Promise<T> {
    const headers: HeadersInit = {
        'ngrok-skip-browser-warning': 'skip-browser-warning',
    };
    const token = getAuthToken();

    if (token && !isLoginRequest) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
        if (body instanceof FormData) {
            config.body = body;
        } else {
            headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(body);
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorData: ApiErrorResponse = { error: `HTTP error! status: ${response.status} ${response.statusText}` };
        try {
            errorData = await response.clone().json();
        } catch (e) {
            console.error("Failed to parse error response as JSON:", e);
            try {
                const textError = await response.text();
                errorData.details = textError || response.statusText;
            } catch (textE) {
                errorData.details = response.statusText;
            }
        }
        throw errorData;
    }

    if (isBlobResponse) {
        // Await the promise to get the Blob, then cast the result to T.
        // The async function will automatically wrap this in Promise<T>.
        const data = await response.blob();
        return data as T; // Assuming T is 'Blob' when isBlobResponse is true.
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return undefined as unknown as Promise<T>;
    }
    if (contentType && contentType.includes("application/json")) {
        return await response.json() as Promise<T>;
    }
    return await response.text() as unknown as Promise<T>;
}