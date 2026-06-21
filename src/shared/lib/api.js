import axios from "axios";

// ── Base URL ───────────────────────────────────────
// Single Spring Boot backend shared by all three roles.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8082";

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// ── Request Interceptor ────────────────────────────
// Attach JWT token automatically on every request.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────
// On 401 Unauthorized → clear session and redirect to /login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
