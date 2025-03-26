export interface Sample {
    id: number;
    name: string;
    type: string;
    location: string;
    collection_date: string;
    storage_condition: string;
    quantity: number;
    price: number;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
}

export type SampleFilter = {
    searchTerm?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
}; 