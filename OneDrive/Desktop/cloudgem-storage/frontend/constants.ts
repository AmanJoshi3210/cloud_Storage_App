export const API_BASE_URL = 'http://localhost:5000';

export const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FILES: '/files',
  UPLOAD: '/files/upload',
};

// Maximum file size (e.g., 10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;