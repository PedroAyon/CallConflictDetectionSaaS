// lib/hooks/useDashboardData.ts
import { useState, useCallback } from 'react';
import { api } from '../api';
import { Company, Employee, CallRecord, CallRecordStatsResponse, ApiErrorResponse, CallRecordFilters } from '../api/apiTypes';

interface DashboardDataState {
    company: Company | null;
    employees: Employee[];
    callRecords: CallRecord[];
    stats: CallRecordStatsResponse | null;
    isLoading: boolean;
    error: string | null;
}

export function useDashboardData() {
    const [dataState, setDataState] = useState<DashboardDataState>({
        company: null,
        employees: [],
        callRecords: [],
        stats: null,
        isLoading: false,
        error: null,
    });

    const clearError = () => setDataState(prev => ({ ...prev, error: null }));
    const setLoading = (loading: boolean) => setDataState(prev => ({ ...prev, isLoading: loading }));

    const fetchCompanyByAdmin = useCallback(async () => {
        clearError();
        setLoading(true);
        try {
            const companyData = await api.company.getMyCompanyDetails();
            setDataState(prev => ({ ...prev, company: companyData, isLoading: false }));
            return companyData; // Return for chaining or direct use
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setDataState(prev => ({ ...prev, error: apiError.error + (apiError.details ? `: ${apiError.details}` : ''), isLoading: false, company: null }));
            throw err;
        }
    }, []);

    const fetchEmployees = useCallback(async (companyId: number) => {
        clearError();
        setLoading(true);
        try {
            const employeeData = await api.employees.getEmployeesByCompany(companyId);
            setDataState(prev => ({ ...prev, employees: employeeData, isLoading: false }));
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setDataState(prev => ({ ...prev, error: `Failed to fetch employees: ${apiError.error}`, isLoading: false, employees: [] }));
        }
    }, []);

    const fetchCallRecords = useCallback(async (companyId: number, filters: CallRecordFilters) => {
        clearError();
        setLoading(true);
        try {
            const records = await api.callRecords.getCallRecords(companyId, filters);
            setDataState(prev => ({ ...prev, callRecords: records, isLoading: false }));
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setDataState(prev => ({ ...prev, error: `Failed to fetch call records: ${apiError.error}`, isLoading: false, callRecords: [] }));
        }
    }, []);

    const fetchCallRecordStats = useCallback(async (companyId: number, filters: CallRecordFilters) => {
        clearError();
        setLoading(true);
        try {
            const statsData = await api.callRecords.getCallRecordStats(companyId, filters);
            setDataState(prev => ({ ...prev, stats: statsData, isLoading: false }));
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setDataState(prev => ({ ...prev, error: `Failed to fetch stats: ${apiError.error}`, isLoading: false, stats: null }));
        }
    }, []);

    const getCallRecording = useCallback(async (filename: string): Promise<Blob> => {
        clearError();
        setLoading(true);
        try {
            const blob = await api.recordings.serveRecording(filename);
            setDataState(prev => ({ ...prev, isLoading: false }));
            return blob;
        } catch (err) {
            const apiError = err as ApiErrorResponse;
            setDataState(prev => ({ ...prev, error: `Failed to serve recording: ${apiError.error}`, isLoading: false }));
            throw err;
        }
    }, []);


    const fetchAllDashboardData = useCallback(async (adminUsername: string, filters: CallRecordFilters) => {
        setLoading(true);
        try {
            const companyData = await fetchCompanyByAdmin();
            if (companyData?.company_id) {
                await Promise.all([
                    fetchEmployees(companyData.company_id),
                    fetchCallRecords(companyData.company_id, filters),
                    fetchCallRecordStats(companyData.company_id, filters),
                ]);
            }
        } catch (err) {
            // Error is already set by individual fetch functions
        } finally {
            setLoading(false); // Ensure loading is false even if one part fails early
        }
    }, [fetchCompanyByAdmin, fetchEmployees, fetchCallRecords, fetchCallRecordStats]);


    return {
        ...dataState,
        fetchCompanyByAdmin,
        fetchEmployees,
        fetchCallRecords,
        fetchCallRecordStats,
        getCallRecording: getCallRecording,
        fetchAllDashboardData: fetchAllDashboardData,
        clearDashboardDataError: clearError,
    };
}