import { createClient } from '@supabase/supabase-js';
import { Sample } from '../types/sample';
import samples from '../samples.json';

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

export async function loadSamples() {
    try {
        console.log('Starting to load samples...');
        console.log('Supabase URL:', supabaseUrl);
        console.log('Number of samples to load:', samples.length);
        
        // Clear existing samples
        const { error: deleteError } = await supabase
            .from('samples')
            .delete()
            .neq('id', 0); // Delete all records
            
        if (deleteError) {
            console.error('Error clearing existing samples:', deleteError);
            throw new Error(`Error clearing existing samples: ${deleteError.message}`);
        }

        console.log('Successfully cleared existing samples');

        // Insert new samples in batches of 50
        const batchSize = 50;
        const sampleData = samples as Sample[];
        
        for (let i = 0; i < sampleData.length; i += batchSize) {
            const batch = sampleData.slice(i, i + batchSize);
            console.log(`Inserting batch ${i / batchSize + 1} of ${Math.ceil(sampleData.length / batchSize)}`);
            
            // Transform the batch data to use snake_case
            const transformedBatch = batch.map(sample => transformKeys(sample));
            console.log('First item in transformed batch:', transformedBatch[0]);
            
            const { error: insertError } = await supabase
                .from('samples')
                .insert(transformedBatch);
                
            if (insertError) {
                console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
                throw new Error(`Error inserting batch ${i / batchSize + 1}: ${insertError.message}`);
            }
            
            console.log(`Successfully inserted batch ${i / batchSize + 1}`);
        }

        console.log('Successfully loaded all samples!');
        return { success: true };
    } catch (error) {
        console.error('Error loading samples:', error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: String(error) };
    }
} 