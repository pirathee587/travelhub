import { useEffect, useState } from "react";
import { getOwnerAuthHeaders } from "./owner-auth-headers";
import { MOCK_USER_ID, isUsingMockAuth } from "./mock-auth";

const API_BASE = "http://localhost:8080/api/v1/owner/session";
const SESSION_EVENT = "travelhub:owner-session-changed";

export type OwnerSession = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean | null;
  isApproved: boolean;
  accessGranted: boolean;
  message: string;
};

type SessionState = {
  session: OwnerSession | null;
  loading: boolean;
  error: string | null;
};

let _cache: SessionState = { session: null, loading: true, error: null };

export function invalidateOwnerSession() {
  _cache = { session: null, loading: true, error: null };
  window.dispatchEvent(new CustomEvent(SESSION_EVENT));
}

export async function fetchOwnerSession(): Promise<OwnerSession | null> {
  try {
    const res = await fetch(API_BASE, {
      headers: {
        "Accept": "application/json",
        ...getOwnerAuthHeaders(),
      },
      mode: "cors",
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body.message ?? `Session check failed (${res.status})`;
      console.error("Failed to fetch owner session:", message);
      return null;
    }
    return (await res.json()) as OwnerSession;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch owner session:", message);
    return null;
  }
}

export function useOwnerSession(): SessionState & { refresh: () => void } {
  const [state, setState] = useState<SessionState>(_cache);

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const session = await fetchOwnerSession();
    if (!session) {
      const next = {
        session: null,
        loading: false,
        error: "Could not verify owner session. Is the backend running?",
      };
      _cache = next;
      setState(next);
      return;
    }
    const next = { session, loading: false, error: null };
    _cache = next;
    setState(next);
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(SESSION_EVENT, handler);
    return () => window.removeEventListener(SESSION_EVENT, handler);
  }, []);

  return { ...state, refresh: load };
}

export function getTestingOwnerLabel(): string {
  if (isUsingMockAuth()) {
    return `Owner #${MOCK_USER_ID} (mock)`;
  }
  return "Authenticated owner";
}
