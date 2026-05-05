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
    timeout: 10000,
});

// ── Request Interceptor ────────────────────────────
// Every request-ல் token automatically add (if available)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
