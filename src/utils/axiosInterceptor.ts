import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Set baseURL từ biến môi trường - cần thiết cho production (Vercel)
// Ở dev mode, Vite proxy xử lý /api -> localhost:9092
// Ở production, cần baseURL trỏ đến backend thực tế (ngrok URL)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
axios.defaults.baseURL = apiBaseUrl;
console.log('API URL:', apiBaseUrl || '(using relative URL with Vite proxy)');

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
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor để xử lý lỗi 401
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Nếu lỗi 401 (Unauthorized)
        if (error.response?.status === 401) {
            // Xóa token cũ nếu có
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];

            // Mở modal đăng nhập nếu handler đã được đăng ký
            if (globalAuthModalHandler) {
                globalAuthModalHandler();
            }
        }

        return Promise.reject(error);
    }
);

export default axios;

