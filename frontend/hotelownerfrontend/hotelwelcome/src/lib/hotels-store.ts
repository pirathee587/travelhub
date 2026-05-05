import { useEffect, useState } from "react";
import { getEmailFromToken } from "./auth-utils";

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

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useHotels(status: string = "Approved") {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}?status=${status}`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setHotels(data);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [status]);

  return { hotels, loading, refresh: fetchHotels };
}

export async function deleteHotel(id: string) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
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
        const headers = getAuthHeaders();
        const fetchByStatus = async (status: string) => {
          const res = await fetch(`${API_BASE}?status=${status}`, { headers });
          if (!res.ok) return [];
          return (await res.json()) as Hotel[];
        };

        // Fetch all categories in parallel to avoid flickering
        const results = await Promise.all([
          fetchByStatus("Pending"),
          fetchByStatus("Approved"),
          fetchByStatus("Rejected")
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

export async function updateHotel(id: string, patch: any) {
  const formData = new FormData();
  
  // Map form fields to backend expectations if needed
  const hotelName = patch.hotelName || patch.name;
  const location = patch.location || patch.address;
  const phone = patch.hotelContactNumber || patch.phone;
  const email = patch.hotelEmail || patch.email;
  const priceFrom = patch.priceFrom !== undefined ? patch.priceFrom : patch.pricePerNight;

  if (hotelName) formData.append("hotelName", hotelName);
  if (location) formData.append("location", location);
  if (patch.destination) formData.append("destination", patch.destination);
  if (patch.district) formData.append("district", patch.district);
  if (patch.description) formData.append("description", patch.description);
  
  if (priceFrom !== undefined) formData.append("priceFrom", String(priceFrom));
  if (patch.priceTo !== undefined) formData.append("priceTo", String(patch.priceTo));
  
  if (patch.imageUrl) formData.append("imageUrl", patch.imageUrl);
  if (phone) formData.append("phoneNumber", phone);
  if (patch.hotlineNumber) formData.append("hotlineNumber", patch.hotlineNumber);
  if (patch.ownerName) formData.append("ownerName", patch.ownerName);
  if (patch.ownerNic) formData.append("ownerNic", patch.ownerNic);
  
  if (email) {
    formData.append("ownerEmail", email);
  }

  try {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers,
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to update hotel");
    }
    return (await response.json()) as Hotel;
  } catch (error) {
    console.error("Failed to update hotel:", error);
    throw error;
  }
}
