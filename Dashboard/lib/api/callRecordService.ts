// lib/api/callRecordService.ts
import { baseRequest } from './coreApiClient';
import { CallRecordFilters, CallRecordListResponse, CallRecordStatsResponse } from './apiTypes';

export const callRecordService = {
    getCallRecords: async (
        companyId: number,
        filters: CallRecordFilters
    ): Promise<CallRecordListResponse> => {
        const queryParams = new URLSearchParams({
            start_time: filters.start_time,
            end_time: filters.end_time,
        });
        if (filters.employee_id !== undefined) {
            queryParams.append('employee_id', String(filters.employee_id));
        }

        // Corrected URL template
        const url = `/companies/${companyId}/call_records?${queryParams.toString()}`;
        return baseRequest<CallRecordListResponse>(url, 'GET');
    },

    getCallRecordStats: async (
        companyId: number,
        filters: CallRecordFilters
    ): Promise<CallRecordStatsResponse> => {
        const queryParams = new URLSearchParams({
            start_time: filters.start_time,
            end_time: filters.end_time,
        });
        if (filters.employee_id !== undefined) {
            queryParams.append('employee_id', String(filters.employee_id));
        }

        // Corrected URL template for stats
        const url = `/companies/${companyId}/call_records/stats?${queryParams.toString()}`;
        return baseRequest<CallRecordStatsResponse>(url, 'GET');
    },
};
