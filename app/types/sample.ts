export type Sample = {
  id: string;
  collection_date: string;
  created_at: string;
  description: string | null;
  geog: unknown;
  institution_contact_email: string | null;
  institution_contact_name: string | null;
  institution_name: string;
  inStock: boolean;
  latitude: number;
  longitude: number;
  name: string;
  price: number;
  quantity: number;
  sample_type: string;
  storage_condition?: string;
  storage_location: string;
  updated_at: string;
  user_id: string | null;
};

export interface CartItem {
  sample: Sample;
  quantity_selected: number;
  added_at?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sample_id: string;
  quantity: number;
  price: number;
  total: number;
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