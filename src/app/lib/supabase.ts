import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const PRODUCT_BUCKET = 'product-images';

// Returns a Supabase client authenticated with the employee's JWT token.
// This lets storage uploads pass through RLS (authenticated policy).
function getClient(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth:   { persistSession: false },
  });
}

// Upload a single image file to the product-images bucket.
// Returns the public URL of the uploaded file.
export async function uploadProductImage(token: string, file: File): Promise<string> {
  const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb   = getClient(token);

  const { error } = await sb.storage
    .from(PRODUCT_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(error.message);

  const { data } = sb.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Delete an image from storage by its full public URL.
export async function deleteProductImage(token: string, publicUrl: string): Promise<void> {
  const sb   = getClient(token);
  const path = publicUrl.split(`/${PRODUCT_BUCKET}/`)[1];
  if (!path) return;
  await sb.storage.from(PRODUCT_BUCKET).remove([path]);
}
