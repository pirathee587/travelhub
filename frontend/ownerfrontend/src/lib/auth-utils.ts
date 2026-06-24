export function getEmailFromToken(): string | undefined {
  try {
    const token = localStorage.getItem("token");
    if (!token) return undefined;
    const payload = JSON.parse(atob(token.split(".")[1]));
    // JWT subject is the user's email (set by Spring Security)
    return payload.sub || payload.email || undefined;
  } catch {
    return undefined;
  }
}
