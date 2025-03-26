export interface Sample {
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

export interface Database {
    public: {
        Tables: {
            samples: {
                Row: Sample;
                Insert: Omit<Sample, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Sample, 'id' | 'created_at' | 'updated_at'>>;
            };
        };
    };
} 