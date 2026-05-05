import { useEffect, useState } from "react";

export type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar: string; // URL from Supabase or empty string
};

const API_BASE = "http://localhost:8080/api/v1/owner/profile";

const defaultProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  avatar: "",
};

// ── Auth header helper ─────────────────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Map backend response → Profile ────────────────────────────────────────────
function mapResponse(data: Record<string, string>): Profile {
  return {
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.telephone ?? "",
    avatar: data.profileImage ?? "",
  };
}

// ── Fetch profile from backend ─────────────────────────────────────────────────
export async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(API_BASE, { headers: authHeaders() });
    if (!res.ok) throw new Error("Not authorised");
    const data = await res.json();
    return mapResponse(data);
  } catch {
    return defaultProfile;
  }
}

// ── Update name / phone via PUT ────────────────────────────────────────────────
export async function updateProfile(
  patch: Partial<Pick<Profile, "name" | "phone">>
): Promise<Profile> {
  const body: Record<string, string> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.phone !== undefined) body.telephone = patch.phone;

  const res = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  const data = await res.json();
  return mapResponse(data);
}

// ── Upload profile photo ───────────────────────────────────────────────────────
export async function uploadAvatar(file: File): Promise<Profile> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/image`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload photo");
  const data = await res.json();
  return mapResponse(data);
}

// ── React hook ────────────────────────────────────────────────────────────────
// Fetches from the backend on mount; returns live profile state.
// Components can call mutateProfile() to instantly update the local cache
// after a successful API call without needing another round-trip.
const CACHE_EVENT = "travelhub:profile-changed";

let _cache: Profile = defaultProfile;

export function mutateProfile(next: Profile) {
  _cache = next;
  window.dispatchEvent(new CustomEvent(CACHE_EVENT, { detail: next }));
}

export function useProfile(): Profile {
  const [profile, setProfile] = useState<Profile>(_cache);

  useEffect(() => {
    // Fetch from backend on first mount
    fetchProfile().then((p) => {
      _cache = p;
      setProfile(p);
    });

    // Listen for in-app updates (e.g., after save)
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Profile>).detail;
      setProfile(detail);
    };
    window.addEventListener(CACHE_EVENT, handler);
    return () => window.removeEventListener(CACHE_EVENT, handler);
  }, []);

  return profile;
}

// ── Initials helper ───────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}