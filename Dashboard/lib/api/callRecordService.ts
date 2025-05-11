// lib/api/callRecordService.ts
import { baseRequest } from './coreApiClient';
import { CallRecordFilters, CallRecordListResponse, CallRecordStatsResponse } from './apiTypes';

export const callRecordService = {
    getCallRecords: async (companyId: number, filters: CallRecordFilters): Promise<CallRecordListResponse> => {
        const queryParams = new URLSearchParams({
            start_time: filters.start_time,
            end_time: filters.end_time,
        });
        if (filters.employee_id !== undefined) {
            queryParams.append('employee_id', filters.employee_id.toString());
        }
        return baseRequest<CallRecordListResponse>(`/companies/<span class="math-inline">\{companyId\}/call\_records?</span>{queryParams.toString()}`, 'GET');
    },
    getCallRecordStats: async (companyId: number, filters: CallRecordFilters): Promise<CallRecordStatsResponse> => {
        const queryParams = new URLSearchParams({
            start_time: filters.start_time,
            end_time: filters.end_time,
        });
        if (filters.employee_id !== undefined) {
            queryParams.append('employee_id', filters.employee_id.toString());
        }
        return baseRequest<CallRecordStatsResponse>(`/companies/<span class="math-inline">\{companyId\}/call\_records/stats?</span>{queryParams.toString()}`, 'GET');
    },
};