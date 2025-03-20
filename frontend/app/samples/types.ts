export interface Sample {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  quantity: number;
  unit: string;
  provider: string;
  location: {
    lat: number;
    lng: number;
  };
  // Add any other fields that might be needed
} 