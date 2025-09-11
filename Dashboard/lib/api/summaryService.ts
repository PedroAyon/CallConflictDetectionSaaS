// lib/api/summaryService.ts
import { baseRequest } from './coreApiClient';
import { SimpleMessageResponse } from './apiTypes';

export interface SummaryResponse {
    summary: string;
}

export const summaryService = {
    getSummary: async (companyId: number, summaryDate: string): Promise<SummaryResponse> => {
        const url = `/summaries/${companyId}/${summaryDate}`;
        return baseRequest<SummaryResponse>(url, 'GET');
    },

    addOrUpdateSummary: async (companyId: number, day?: string): Promise<SummaryResponse> => {
        const url = `/summaries`;
        const body = { company_id: companyId, day };
        // The backend returns the newly generated summary, so we should expect that in the response.
        return baseRequest<SummaryResponse>(url, 'POST', body);
    },
};