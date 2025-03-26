export interface Sample {
    id: number;
    name: string;
    type: string;
    host?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    collection_date?: string;
    storage_condition?: string;
    availability?: string;
    contact?: string;
    description?: string;
    price?: number;
    quantity?: number;
    unit?: string;
    created_at?: string;
}

export type SampleFilter = {
    searchTerm?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
}; 