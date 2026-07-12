import { getMockOrRealOwnerId, isUsingMockAuth } from "./mock-auth";

/** Shared auth headers for owner API calls (mock owner id or real JWT). */
export function getOwnerAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = !isUsingMockAuth() ? localStorage.getItem("token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const ownerId = getMockOrRealOwnerId();
  if (ownerId != null) {
    headers["X-Owner-Id"] = String(ownerId);
  }
  return headers;
}
