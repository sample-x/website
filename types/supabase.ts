export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      samples: {
        Row: {
          id: string;
          name: string;
          type: string;
          location: string;
          collection_date: string;
          storage_condition: string;
          quantity: number;
          price: number;
          description: string | null;
          latitude: number;
          longitude: number;
          hash: string;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          name: string;
          type: string;
          location: string;
          collection_date: string;
          storage_condition: string;
          quantity: number;
          price: number;
          description?: string | null;
          latitude: number;
          longitude: number;
          hash: string;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          name?: string;
          type?: string;
          location?: string;
          collection_date?: string;
          storage_condition?: string;
          quantity?: number;
          price?: number;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          hash?: string;
          created_at?: string;
          updated_at?: string;
        }
      }
      cart: {
        Row: {
          id: number;
          sample_id: string;
          quantity: number;
          created_at: string;
        }
        Insert: {
          id?: number;
          sample_id: string;
          quantity: number;
          created_at?: string;
        }
        Update: {
          id?: number;
          sample_id?: string;
          quantity?: number;
          created_at?: string;
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 