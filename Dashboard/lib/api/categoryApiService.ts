import { baseRequest } from './coreApiClient';
import { AddCategoryRequest, CategoryListResponse, SimpleMessageResponse } from './apiTypes';

export const categoryService = {
    addCategory: async (companyId: number, data: AddCategoryRequest): Promise<SimpleMessageResponse> => {
        return baseRequest<SimpleMessageResponse>(`/companies/${companyId}/categories`, 'POST', data);
    },
    getCategoriesByCompany: async (companyId: number): Promise<CategoryListResponse> => {
        return baseRequest<CategoryListResponse>(`/companies/${companyId}/categories`, 'GET');
    },
    deleteCategory: async (companyId: number, categoryId: number): Promise<SimpleMessageResponse> => {
        return baseRequest<SimpleMessageResponse>(`/companies/${companyId}/categories/${categoryId}`, 'DELETE');
    },
};
