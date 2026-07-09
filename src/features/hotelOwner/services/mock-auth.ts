/**
 * TEMPORARY mock auth for hotel-owner dashboard testing.
 * Set MOCK_MODE = false when real login is integrated.
 */

// Change MOCK_USER_ID to test a different owner (e.g. 42)
export const MOCK_USER_ID = 40;

const MOCK_MODE = false;

export function isUsingMockAuth(): boolean {
  return MOCK_MODE;
}

/** Owner id used for API calls — mock id now, JWT userId later */
export function getMockOrRealOwnerId(): number | undefined {
  if (MOCK_MODE) {
    return MOCK_USER_ID;
  }
  return getOwnerIdFromToken();
}

export function getOwnerIdFromToken(): number | undefined {
  try {
    const token = localStorage.getItem("token");
    if (!token) return undefined;
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload.userId ?? payload.id;
    return id != null ? Number(id) : undefined;
  } catch {
    return undefined;
  }
}
