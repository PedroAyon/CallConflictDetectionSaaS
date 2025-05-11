// lib/api/recordingService.ts
import { baseRequest } from './coreApiClient';

export const recordingService = {
    serveRecording: async (filename: string): Promise<Blob> => {
        const encodedFilename = encodeURIComponent(filename);
        return baseRequest<Blob>(`/recordings/${encodedFilename}`, 'GET', undefined, true);
    },
};