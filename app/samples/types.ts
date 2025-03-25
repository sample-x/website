// Shared Sample type definition for consistent use across components
export interface Sample {
  id: string | number;
  name: string;
  type: string;
  host?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
  collectionDate?: string;
  storageCondition?: string;
  availability: string;
  contact?: string;
  description?: string;
  price?: number;
  quantity?: number;
  unit?: string;
} 