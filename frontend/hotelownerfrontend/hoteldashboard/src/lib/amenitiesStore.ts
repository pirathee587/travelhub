export type Amenity = {
  id: string;
  name: string;
  description?: string;
  iconName?: string;
};

const STORAGE_KEY = "amenities.v1";

function safeParse(value: string | null): Amenity[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as Amenity[];
  } catch {
    return [];
  }
}

export function loadAmenities(): Amenity[] {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveAmenities(amenities: Amenity[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(amenities));
}

export function addAmenity(input: Omit<Amenity, "id">): Amenity {
  const current = loadAmenities();
  const next: Amenity = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: input.name,
    description: input.description?.trim() || undefined,
    iconName: input.iconName?.trim() || undefined,
  };
  saveAmenities([next, ...current]);
  return next;
}

