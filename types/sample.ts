export interface Sample {
    id: string;
    name: string;
    type?: string;
    description?: string;
    location?: string;
    price: number;
    latitude?: number;
    longitude?: number;
    collection_date?: string;
    storage_condition?: string;
    quantity?: number;
    hash?: string;
    created_at?: string;
    updated_at?: string;
    inStock?: boolean;
    references?: string[];
    institution_name?: string;
    institution_contact_name?: string;
    institution_contact_email?: string;
}

export type SampleFilter = {
    searchTerm?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
}; 