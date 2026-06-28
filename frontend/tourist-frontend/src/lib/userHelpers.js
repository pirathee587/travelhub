/**
 * User Helper Functions
 * Provides consistent current user ID and name across the entire application.
 *
 * CURRENT USER: ID 32 (Harikeshan / Harith Keshan) — single dev-mode user.
 * All user-specific operations (trips, bookings, reviews, documents) use this ID.
 *
 * TODO: When JWT authentication is implemented, replace `defaultUserId()` with
 *       a call that reads the user ID from the decoded JWT token (e.g., from
 *       an AuthContext or a decoded Bearer token), and remove the hardcoded 32.
 */

/** The active application user ID during development. */
export const CURRENT_USER_ID = 32;

/**
 * Get the default user ID for the application.
 * Returns 32 (Harikeshan) for all user-specific operations.
 * @returns {number} The current active user ID
 */
export const defaultUserId = () => {
    // TODO: Replace with JWT-derived user ID when auth is implemented.
    return CURRENT_USER_ID;
};

/**
 * Get the default user name for the application.
 * First checks localStorage (set after a successful profile load),
 * then falls back to the name stored in sessionStorage from a previous load,
 * and finally falls back to a safe placeholder.
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
