import { createClient } from '@supabase/supabase-js';
import { Sample } from '@/types/sample';
import samplesJson from '@/data/samples.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to transform camelCase to snake_case and map fields correctly
function transformSample(sample: any): Sample {
    const transformed = {
        id: sample.id,
        name: sample.name,
        type: sample.type,
        location: sample.location,
        collection_date: sample.collectionDate,
        storage_condition: sample.storageCondition,
        quantity: sample.quantity,
        price: sample.price,
        description: sample.description,
        latitude: sample.latitude,
        longitude: sample.longitude,
        availability: sample.availability,
        contact: sample.contact,
        inStock: sample.quantity > 0,
        created_at: new Date().toISOString(),
        coordinates: sample.latitude && sample.longitude ? [sample.latitude, sample.longitude] : undefined,
        metadata: {
            host: sample.host,
            unit: sample.unit
        }
    } as Sample;

    return transformed;
}

export async function loadSamples(): Promise<Sample[]> {
    try {
        return samplesJson.map(transformSample);
    } catch (error) {
        console.error('Error loading samples:', error);
        return [];
    }
}

export async function loadSamplesFromSupabase() {
    try {
        console.log('Starting to load samples...');
        console.log('Supabase URL:', supabaseUrl);
        console.log('Number of samples to load:', samplesJson.length);
        
        // Clear existing samples
        const { error: deleteError } = await supabase
            .from('samples')
            .delete()
            .neq('id', 0);
            
        if (deleteError) {
            throw new Error(`Error clearing samples: ${deleteError.message}`);
        }

        // Transform and insert new samples in batches of 50
        const batchSize = 50;
        const samples = samplesJson.map(transformSample);
        
        for (let i = 0; i < samples.length; i += batchSize) {
            const batch = samples.slice(i, i + batchSize);
            const { error: insertError } = await supabase
                .from('samples')
                .insert(batch);
                
            if (insertError) {
                throw new Error(`Error inserting batch ${i}: ${insertError.message}`);
            }
        }

        console.log('Successfully loaded all samples');
        return true;
    } catch (error) {
        console.error('Error in loadSamples:', error);
        throw error;
    }
} 