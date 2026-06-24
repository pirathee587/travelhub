import { getMockOrRealOwnerId } from "./mock-auth";

/** Shared auth headers for owner API calls (mock owner id or real JWT). */
export function getOwnerAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const ownerId = getMockOrRealOwnerId();
  if (ownerId != null) {
    headers["X-Owner-Id"] = String(ownerId);
  }
  return headers;
}
