
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer service role key for admin actions (server-side only), fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFileToSupabase(file: File, bucket = 'products', pathPrefix = 'uploads'): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/\s+/g, "-");
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`;
    const filePath = `${pathPrefix}/${filename}`;

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

