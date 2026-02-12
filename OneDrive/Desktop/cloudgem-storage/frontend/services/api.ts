import { API_BASE_URL, ENDPOINTS } from '../constants';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper to set token from AuthContext
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Helper to get current token
export const getAccessToken = () => accessToken;

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

export const apiRequest = async <T>(
  endpoint: string,
  method: RequestMethod = 'GET',
  body?: any,
  isFileUpload: boolean = false
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {};
  if (!isFileUpload) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Crucial for sending/receiving cookies
  };

  if (body) {
    config.body = isFileUpload ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - Refresh Token Logic
    if (response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Attempt to refresh the token using the HttpOnly cookie
          const refreshResponse = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newAccessToken = data.accessToken;
            setAccessToken(newAccessToken);
            onRefreshed(newAccessToken);
            isRefreshing = false;
          } else {
            // Refresh failed, user must login again
            isRefreshing = false;
            setAccessToken(null);
            throw new Error('Session expired');
          }
        } catch (error) {
          isRefreshing = false;
          setAccessToken(null);
          throw error;
        }
      }

      // Queue the retry
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber((token) => {
          // Retry original request with new token
          const retryHeaders: HeadersInit = { ...headers, Authorization: `Bearer ${token}` };
          const retryConfig = { ...config, headers: retryHeaders };
          fetch(url, retryConfig)
            .then(async (resp) => {
              if (!resp.ok) throw new Error(resp.statusText);
              return resp.json();
            })
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        });
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    // For 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};