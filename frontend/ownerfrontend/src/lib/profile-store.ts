import { useEffect, useState } from "react";
import { getOwnerAuthHeaders } from "./owner-auth-headers";

export type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

const API_BASE = "http://localhost:8080/api/v1/owner/profile";

const defaultProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  avatar: "",
};

function mapResponse(data: Record<string, string>): Profile {
  return {
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.telephone ?? "",
    avatar: data.profileImage ?? "",
  };
}

export async function fetchProfile(): Promise<Profile> {
  try {
    const res = await fetch(API_BASE, { headers: getOwnerAuthHeaders() });
    if (!res.ok) throw new Error("Not authorised");
    return mapResponse(await res.json());
  } catch {
    return defaultProfile;
  }
}

export async function updateProfile(
  patch: Partial<Pick<Profile, "name" | "phone">>,
): Promise<Profile> {
  const body: Record<string, string> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.phone !== undefined) body.telephone = patch.phone;

  const res = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getOwnerAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return mapResponse(await res.json());
}

export async function uploadAvatar(file: File): Promise<Profile> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/image`, {
    method: "POST",
    headers: getOwnerAuthHeaders(),
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload photo");
  return mapResponse(await res.json());
}

const CACHE_EVENT = "travelhub:profile-changed";
let _cache: Profile = defaultProfile;

export function mutateProfile(next: Profile) {
  _cache = next;
  window.dispatchEvent(new CustomEvent(CACHE_EVENT, { detail: next }));
}

export function useProfile(): Profile {
  const [profile, setProfile] = useState<Profile>(_cache);

  useEffect(() => {
    fetchProfile().then((p) => {
      _cache = p;
      setProfile(p);
    });

    const handler = (e: Event) => {
      setProfile((e as CustomEvent<Profile>).detail);
    };
    window.addEventListener(CACHE_EVENT, handler);
    return () => window.removeEventListener(CACHE_EVENT, handler);
  }, []);

  return profile;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
