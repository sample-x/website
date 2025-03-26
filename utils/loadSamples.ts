import { createClient } from '@supabase/supabase-js';
import { Sample } from '@/types/sample';
import samplesJson from '@/data/samples.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to transform camelCase to snake_case
function transformKeys(obj: any): any {
    const transformed: any = {};
    Object.keys(obj).forEach(key => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        transformed[snakeKey] = obj[key];
    });
    return transformed;
}

export async function loadSamples(): Promise<Sample[]> {
    try {
        return samplesJson as Sample[];
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

        // Insert new samples in batches of 50
        const batchSize = 50;
        const samples = samplesJson as Sample[];
        
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