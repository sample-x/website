export interface Sample {
  id: number;
  name: string;
  type: string;
  location: string | null;
  collection_date?: string | null;
  storage?: string;
  storage_condition?: string | null;
  quantity: number;
  price: number;
  description?: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  imageUrl?: string;
  inStock: boolean;
  hash?: string;
  metadata?: Record<string, any>;
  // Additional fields for sample table
  contact?: string;
  // Institution and ownership fields
  institution_name?: string;
  institution_contact_name?: string;
  institution_contact_email?: string;
  sample_owner_id?: string;
  // Sample status
  status?: 'private' | 'public';
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