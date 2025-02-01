import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upload an image file to supabase storage
 * @param image The image data in base64 as a Data URL
 * @param supabase The supabase client
 */
export const uploadAvatar = async (
  imageFile: File,
  supabase: SupabaseClient,
  userId: string,
) => {
  // get file extension from data url string
  const ext = imageFile.name.split('.').pop();

  // upload the image to supabase storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .update(`${userId}.${ext}`, `${userId}.${ext}`, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    throw { message: error.message };
  } else {
    return { message: 'Image uploaded succesfully!', url: data.fullPath };
  }
};
