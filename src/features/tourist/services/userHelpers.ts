/**
 * User Helper Functions
 * Provides dynamic current user ID and name across the application based on the active session.
 */

/**
 * Get the default user ID for the application from the logged-in session.
 * @returns {number | null} The current active user ID, or null if guest/not logged in.
 */
export const defaultUserId = (): number | null => {
    const userStr = localStorage.getItem('travelhub_user') || localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.id || null;
        } catch (e) {
            return null;
        }
    }
    return null;
};

/**
 * Get the default user name for the application.
 * @returns {string} The current user's display name, or "Traveler" if not logged in.
 */
export const defaultUserName = (): string => {
    const userStr = localStorage.getItem('travelhub_user') || localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.name || "Traveler";
        } catch (e) {
            return "Traveler";
        }
    }
    return localStorage.getItem("userName") || "Traveler";
};

/**
 * Get user info object with both ID and name.
 * @returns {{ userId: number | null, userName: string }}
 */
export const getUserInfo = () => {
    return {
        userId: defaultUserId(),
        userName: defaultUserName(),
    };
};
