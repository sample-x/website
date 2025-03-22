// Shared Sample type definition for consistent use across components
export interface Sample {
  id: number;
  name: string;
  type: string;
  host: string;
  location: string;
  coordinates?: [number, number];
  latitude?: string;
  longitude?: string;
  collectionDate?: string;
  storageCondition?: string;
  availability: string;
  contact?: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
} 