// lib/api/employeeService.ts
import { baseRequest } from './coreApiClient';
import { AddEmployeeRequest, UpdateEmployeeRequest, EmployeeListResponse, SimpleMessageResponse } from './apiTypes';

export const employeeService = {
    addEmployee: async (companyId: number, data: AddEmployeeRequest): Promise<SimpleMessageResponse> => {
        return baseRequest<SimpleMessageResponse>(`/companies/${companyId}/employees`, 'POST', data);
    },
    getEmployeesByCompany: async (companyId: number): Promise<EmployeeListResponse> => {
        return baseRequest<EmployeeListResponse>(`/companies/${companyId}/employees`, 'GET');
    },
    updateEmployee: async (employeeId: number, data: UpdateEmployeeRequest): Promise<SimpleMessageResponse> => {
        return baseRequest<SimpleMessageResponse>(`/employees/${employeeId}`, 'PUT', data);
    },
    deleteEmployee: async (employeeId: number): Promise<SimpleMessageResponse> => {
        return baseRequest<SimpleMessageResponse>(`/employees/${employeeId}`, 'DELETE');
    },
};