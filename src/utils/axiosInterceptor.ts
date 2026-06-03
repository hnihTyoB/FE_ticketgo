import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
axios.defaults.baseURL = apiBaseUrl;
axios.defaults.withCredentials = true;

// Biến global để lưu trạng thái modal và hàm mở modal
let globalAuthModalHandler: (() => void) | null = null;

// Hàm để đăng ký handler từ component (Header)
export const setAuthModalHandler = (handler: () => void) => {
    globalAuthModalHandler = handler;
};

// Hàm để mở modal từ bất kỳ đâu trong app
export const openAuthModal = () => {
    if (globalAuthModalHandler) {
        globalAuthModalHandler();
    }
};

// Request interceptor để tự động thêm token
axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Bỏ qua trang cảnh báo ngrok (cần thiết khi dùng ngrok free)
        if (apiBaseUrl.includes('ngrok')) {
            config.headers['ngrok-skip-browser-warning'] = 'true';
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

// Response interceptor để xử lý lỗi 401
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // Tránh vòng lặp vô hạn khi request /auth/refresh bị 401
        if (originalRequest.url?.includes('/api/auth/refresh')) {
            isRefreshing = false;
            if (globalAuthModalHandler) {
                globalAuthModalHandler();
            }
            return Promise.reject(error);
        }

        // Bỏ qua không refresh cho các route auth như login, register
        if (
            originalRequest.url?.includes('/api/auth/login') ||
            originalRequest.url?.includes('/api/auth/register')
        ) {
            return Promise.reject(error);
        }

        // Nếu lỗi 401 (Unauthorized)
        if (error.response?.status === 401) {
            // @ts-expect-error - custom property to prevent infinite retry
            if (originalRequest._retry) {
                if (globalAuthModalHandler) {
                    globalAuthModalHandler();
                }
                return Promise.reject(error);
            }

            // @ts-expect-error - custom property
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return axios(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                const response = await axios.post('/api/auth/refresh');
                const { token } = response.data;

                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    processQueue(null, token);
                    isRefreshing = false;
                    return axios(originalRequest);
                } else {
                    throw new Error('Refresh token response missing token');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                delete axios.defaults.headers.common['Authorization'];
                if (globalAuthModalHandler) {
                    globalAuthModalHandler();
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;

