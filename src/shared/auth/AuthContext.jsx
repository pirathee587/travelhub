import { createContext, useContext, useState, useCallback } from "react";
import authApi from "../lib/authApi";

const AuthContext = createContext(null);

// Maps the backend Role enum to the base route for that role's app.
export const ROLE_HOME = {
    TOURIST: "/tourist",
    AGENT: "/agent",
    ADMIN: "/admin",
    HOTEL_OWNER: "/agent", // hotel owners share the agent-style dashboard for now
};

function loadStoredUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(loadStoredUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authApi.login(email, password);
            // data: { token, name, email, role, profileImage, agentId, hotelId, id }
            const loggedInUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role,
                profileImage: data.profileImage,
                agentId: data.agentId,
                hotelId: data.hotelId,
            };
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(loggedInUser));
            // Keep legacy keys some pages still read directly.
            localStorage.setItem("userId", String(data.id));
            localStorage.setItem("userName", data.name || "");
            setUser(loggedInUser);
            return loggedInUser;
        } catch (err) {
            const message =
                err?.response?.data?.message || "Invalid email or password. Please try again.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const data = await authApi.register(payload);
            return data;
        } catch (err) {
            const message =
                err?.response?.data?.message || "Could not create account. Please check your details.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        setUser(null);
    }, []);

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
