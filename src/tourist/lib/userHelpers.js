/**
 * User Helper Functions
 * Provides consistent current user ID and name across the entire application.
 *
 * Now backed by real JWT login (see shared/auth/AuthContext.jsx). After a
 * successful login, AuthContext stores the user's real database ID in
 * localStorage under "userId" and their name under "userName". These
 * helpers simply read that, with a safe fallback for the brief moment
 * before login state is available.
 */

/** Fallback ID used only if no logged-in user is found (should not normally happen). */
export const CURRENT_USER_ID = 32;

/**
 * Get the current logged-in user's ID.
 * Reads the real ID set by AuthContext on login.
 * @returns {number} The current active user ID
 */
export const defaultUserId = () => {
    const stored = localStorage.getItem("userId");
    const parsed = stored ? Number(stored) : NaN;
    return Number.isFinite(parsed) ? parsed : CURRENT_USER_ID;
};

/**
 * Get the current logged-in user's display name.
 * Reads the name cached by AuthContext on login, with a generic fallback.
 * @returns {string} The current user's display name
 */
export const defaultUserName = () => {
    return localStorage.getItem("userName") || "Traveler";
};

/**
 * Get user info object with both ID and name.
 * @returns {{ userId: number, userName: string }}
 */
export const getUserInfo = () => {
    return {
        userId: defaultUserId(),
        userName: defaultUserName(),
    };
};
