// lib/api/userService.ts
import { baseRequest } from './coreApiClient';
import { AddUserRequest, UserResponse, SimpleMessageResponse } from './apiTypes';

export const userService = {
    addUser: async (data: AddUserRequest): Promise<SimpleMessageResponse> => {
        return baseRequest<SimpleMessageResponse>('/users', 'POST', data);
    },
    getUser: async (username: string): Promise<UserResponse> => {
        return baseRequest<UserResponse>(`/users/${username}`, 'GET');
    },
};