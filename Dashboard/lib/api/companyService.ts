// lib/api/companyService.ts
import { baseRequest } from './coreApiClient';
import { AddCompanyRequest, AddCompanyResponse, Company } from './apiTypes';

export const companyService = {
    addCompany: async (data: AddCompanyRequest): Promise<AddCompanyResponse> => {
        return baseRequest<AddCompanyResponse>('/companies', 'POST', data);
    },

    getMyCompanyDetails: async (): Promise<Company> => { // Renamed and no parameter
        return baseRequest<Company>('/companies/admin/me', 'GET');
    },
};