export interface Sample {
  id: string;
  name: string;
  type: string;
  location: string;
  collection_date: string;
  storage: string;
  availability: string;
  price: number;
  latitude: number;
  longitude: number;
  description: string;
  imageUrl?: string;
  inStock: boolean;
  coordinates?: [number, number]; // [latitude, longitude]
  user_id: string;
  created_at: string;
  available_quantity?: number;
  metadata?: Record<string, any>;
  // Additional fields for sample table
  contact?: string;
}

export interface CartItem {
  sample: Sample;
  quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sample_id: string;
  quantity: number;
  price: number;
  samples?: Sample;
}

export interface Order {
  id: string;
  user_id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  payment_intent_id?: string;
  items?: OrderItem[];
}

export interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  user_id: string;
  metadata?: Record<string, any>;
}

export interface SampleFilters {
  search?: string;
  type?: string[];
  location?: string[];
  priceRange?: [number, number];
  inStock?: boolean;
} 