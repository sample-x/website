export interface Sample {
    id: number;
    name: string;
    type: string;
    location: string;
    collection_date?: string;
    storage_condition?: string;
    quantity?: number;
    price?: number;
    description?: string;
    latitude?: number;
    longitude?: number;
    user_id?: string;
    created_at?: string;
    category?: string;
    imageUrl?: string;
    metadata?: Record<string, any>;
}

export type SampleFilter = {
    searchTerm?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
}; 