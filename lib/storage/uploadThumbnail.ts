import { SupabaseClient } from '@supabase/supabase-js';

/** Convert a data‑URL to a Uint8Array */
function dataURLtoUint8(dataUrl: string): Uint8Array {
  const [, mime, b64] = dataUrl.match(/^data:(.+);base64,(.*)$/) || [];
  if (!b64) throw new Error('Bad data‑URL');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

/**
 * Uploads the given base‑64 thumbnail to the `thumbnails` bucket and
 * returns a **public** URL. Creates the bucket on first use.
 */
export async function uploadThumbnail(
  supabase: SupabaseClient,
  userId: string,
  dataUrl: string
): Promise<string> {

  // 1. Ensure bucket exists (no‑op if it already does)
  const bucket = 'thumbnails';
  await supabase.storage.createBucket(bucket, {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg'],
    fileSizeLimit: '1MB'
  }).catch(() => {});   // ignore “already exists” error

  // 2. Build a path that’s unique per user / source
  const fileName = `${userId}/${crypto.randomUUID()}.jpg`;
  const fileBytes = dataURLtoUint8(dataUrl);

  // 3. Upload (with `upsert: true` so re‑uploads just overwrite)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBytes, {
      cacheControl: '3600',
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) throw error;

  // 4. Build a public URL
  const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName).data;
  return publicUrl;
}
