import type { SupabaseClient } from '@supabase/supabase-js';

const mimeToExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/webp': 'webp',
  'image/tiff': 'tiff',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/heif': 'heif',
  'image/heic': 'heic',
  'image/jp2': 'jp2',
  'image/avif': 'avif',
  'image/apng': 'apng',
  'image/vnd.wap.wbmp': 'wbmp',
  'image/vnd.rn-realpix': 'rp',
  'image/vnd.microsoft.icon': 'ico',
  'image/vnd.adobe.photoshop': 'psd',
};

/**
 * Upload an image file to supabase storage
 * @param image The image data in base64 as a Data URL
 * @param mimeType The mime type of the image
 * @param supabase The supabase client
 * @param userId The user id to use as the filename
 */
export const uploadAvatar = async (
  imageData: string,
  mimeType: string,
  supabase: SupabaseClient,
  userId: string,
) => {
  // get file extension from data url string
  const ext = mimeToExtension[mimeType];

  const filename = `${userId}.${ext}`;

  const response = await fetch(imageData);
  const blob = await response.blob();

  // upload the image to supabase storage
  const { error } = await supabase.storage
    .from('avatars')
    .update(filename, blob, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw { message: error.message };
  }

  const {
    data: { publicUrl },
  } = await supabase.storage.from('avatars').getPublicUrl(filename);

  const { error: updateAvatarError } = await supabase
    .from('user_infos')
    .update({ avatar_url: publicUrl })
    .eq('user_id', userId);
  if (updateAvatarError) {
    console.error(updateAvatarError);
    throw { message: 'Failed to update profile picture' };
  }

  return { message: 'Image uploaded successfully', url: publicUrl };
};
