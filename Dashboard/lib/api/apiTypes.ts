// lib/api/apiTypes.ts

// --- Generic Error and Message Types ---
export interface ApiErrorResponse {
    error: string;
    details?: string;
}

export interface SimpleMessageResponse {
    message: string;
}

// --- Authentication Types ---
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface UserPayload {
    sub: string; // username
    user_type: 'admin' | 'employee';
    iat: number; // issued at timestamp
    exp: number; // expiration timestamp
    company_id?: number;
    employee_id?: number; // Only for employee user_type
}

export interface ValidateAuthTokenResponse {
    message: string;
    user_payload: UserPayload;
}

// --- User Types ---
export interface AddUserRequest {
    username: string;
    password: string;
}

export interface UserResponse {
    username: string;
}

// --- Company Types ---
export interface Company {
    company_id: number;
    company_name: string;
    subscription_expiration: string; // YYYY-MM-DD
    admin_username: string;
}

export interface AddCompanyRequest {
    company_name: string;
    subscription_expiration: string; // YYYY-MM-DD
    admin_username: string;
    admin_password: string;
}

export interface AddCompanyResponse {
    message: string;
    company: Company;
}

// --- Employee Types ---
export interface Employee {
    employee_id: number;
    company_id: number;
    username: string;
    first_name: string;
    last_name: string;
    gender: 'M' | 'F' | null;
    birthdate: string | null; // YYYY-MM-DD
}

export interface AddEmployeeRequest {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    gender?: 'M' | 'F';
    birthdate?: string; // YYYY-MM-DD
}

export interface UpdateEmployeeRequest extends AddEmployeeRequest {}

export type EmployeeListResponse = Employee[];

// --- Call Record Types ---
export interface CallRecord {
    call_id: number;
    employee_id: number;
    call_timestamp: string; // ISO 8601 string
    call_duration: number;
    transcription: string | null;
    audio_filename: string;
    conflict_value: number | null;
    employee_username?: string;
    employee_first_name?: string;
    employee_last_name?: string;
}

export type CallRecordListResponse = CallRecord[];

export interface CallRecordFilters {
    start_time: string; // ISO 8601 string
    end_time: string; // ISO 8601 string
    employee_id?: number;
}

export interface CallRecordStatsResponse {
    total_calls: number;
    total_duration_seconds: number;
    conflict_percentage: number;
    filters_applied: {
        company_id: number;
        start_time: string; // ISO 8601 string
        end_time: string; // ISO 8601 string
        employee_id: number | null;
    };
}

export interface Category {
    category_id: number;
    company_id: number;
    category_name: string;
    category_description: string | null;
}

export interface AddCategoryRequest {
    category_name: string;
    category_description?: string;
}

export type CategoryListResponse = Category[];