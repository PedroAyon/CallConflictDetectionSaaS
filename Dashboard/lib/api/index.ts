// lib/api/index.ts
import { authService } from './authService';
import { userService } from './userService';
import { companyService } from './companyService';
import { employeeService } from './employeeService';
import { callRecordService } from './callRecordService';
import { recordingService } from './recordingService';
import { categoryService } from './categoryApiService';

export const api = {
    auth: authService,
    users: userService,
    company: companyService,
    employees: employeeService,
    callRecords: callRecordService,
    recordings: recordingService,
    categories: categoryService
};