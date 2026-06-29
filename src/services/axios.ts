import axios from 'axios';

// ── Base URL ───────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL
    || 'http://localhost:8080';

// ── Axios Instance ─────────────────────────────────
const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// ── Request Interceptor ────────────────────────────
// Attach JWT token automatically on every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────
// On 401 Unauthorized or 403 Forbidden → clear session and redirect to /login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
