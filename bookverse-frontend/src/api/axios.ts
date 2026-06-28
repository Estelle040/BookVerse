import axios from 'axios';

const api = axios.create({
    baseURL: '',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Только для не-GET запросов или для страницы логина
            const method = error.config?.method || '';
            if (method !== 'get') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getImageUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path;
};

export default api;