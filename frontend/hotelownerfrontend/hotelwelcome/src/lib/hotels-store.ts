import { useEffect, useState } from "react";
import { getOwnerAuthHeaders } from "./owner-auth-headers";

export type District = string;

export type Hotel = {
  id: string;
  hotelName: string;
  destination: string;
  location: string;
  description: string;
  priceFrom: number;
  priceTo: number;
  imageUrl: string;
  amenities: string[];
  district: string;
  hotelEmail: string;
  hotelContactNumber: string;
  phoneNumber?: string;
  hotlineNumber?: string;
  applicationStatus: "Pending" | "Approved" | "Rejected";
};

export type HotelSummary = {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
};

export const DISTRICTS: District[] = [
  "Colombo District",
  "Gampaha District",
  "Kalutara District",
  "Kandy District",
  "Matale District",
  "Nuwara Eliya District",
  "Galle District",
  "Matara District",
  "Hambantota District",
  "Jaffna District",
  "Kilinochchi District",
  "Mannar District",
  "Vavuniya District",
  "Mullaitivu District",
  "Batticaloa District",
  "Ampara District",
  "Trincomalee District",
  "Kurunegala District",
  "Puttalam District",
  "Anuradhapura District",
  "Polonnaruwa District",
  "Badulla District",
  "Moneragala District",
  "Ratnapura District",
  "Kegalle District",
];

const API_BASE = "http://localhost:8080/api/v1/owner/hotels";

export function useHotels(status: string = "Approved") {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}?status=${status}`, {
        headers: getOwnerAuthHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message ?? `Failed to load hotels (${response.status})`);
      }
      setHotels(await response.json());
    } catch (err) {
      console.error("Failed to fetch hotels:", err);
      setHotels([]);
      setError(err instanceof Error ? err.message : "Failed to fetch hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [status]);

  return { hotels, loading, error, refresh: fetchHotels };
}

export function useHotelSummary() {
  const [summary, setSummary] = useState<HotelSummary>({
    approved: 0,
    pending: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/summary`, {
          headers: getOwnerAuthHeaders(),
        });
        if (res.ok && !cancelled) {
          setSummary(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch hotel summary:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, loading };
}

export async function deleteHotel(id: string) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getOwnerAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to delete hotel:", error);
    return false;
  }
}

export function useHotel(hotelId: string) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hotelId) {
      setHotel(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchHotelDetails = async () => {
      setLoading(true);
      try {
        const headers = getOwnerAuthHeaders();
        const fetchByStatus = async (status: string) => {
          const res = await fetch(`${API_BASE}?status=${status}`, { headers });
          if (!res.ok) return [];
          return (await res.json()) as Hotel[];
        };

        const results = await Promise.all([
          fetchByStatus("Pending"),
          fetchByStatus("Approved"),
          fetchByStatus("Rejected"),
        ]);

        const allHotels = results.flat();
        const found = allHotels.find((item) => String(item.id) === String(hotelId));

        if (!cancelled) {
          setHotel(found ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch hotel details:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchHotelDetails();
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  return { hotel, loading };
}

export async function updateHotel(id: string, patch: Record<string, unknown>) {
  const formData = new FormData();

  const hotelName = patch.hotelName || patch.name;
  const location = patch.location || patch.address;
  const phone = patch.hotelContactNumber || patch.phone;
  const email = patch.hotelEmail || patch.email;
  const priceFrom = patch.priceFrom !== undefined ? patch.priceFrom : patch.pricePerNight;

  if (hotelName) formData.append("hotelName", String(hotelName));
  if (location) formData.append("location", String(location));
  if (patch.destination) formData.append("destination", String(patch.destination));
  if (patch.district) formData.append("district", String(patch.district));
  if (patch.description) formData.append("description", String(patch.description));

  if (priceFrom !== undefined) formData.append("priceFrom", String(priceFrom));
  if (patch.priceTo !== undefined) formData.append("priceTo", String(patch.priceTo));

  if (patch.imageUrl) formData.append("imageUrl", String(patch.imageUrl));
  if (phone) formData.append("phoneNumber", String(phone));
  if (patch.hotlineNumber) formData.append("hotlineNumber", String(patch.hotlineNumber));

  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getOwnerAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to update hotel");
  }
  return (await response.json()) as Hotel;
}
