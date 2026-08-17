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
        const token = localStorage.getItem('travelhub_token')
            || localStorage.getItem('token')
            || sessionStorage.getItem('travelhub_token')
            || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────
// Handle API errors gracefully
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Return rejected promise for component-level error handling
        return Promise.reject(error);
    }
);

export default api;
