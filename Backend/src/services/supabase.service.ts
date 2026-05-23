import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const bucketName = process.env.SUPABASE_BUCKET || 'product-images';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const uploadImageToSupabase = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  try {
    if (!supabase) {
      logger.warn('Supabase credentials missing, skipping actual upload.');
      return `https://placeholder-url.com/${fileName}`;
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    logger.error(`Error uploading to Supabase: ${error.message}`);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

export const deleteImageFromSupabase = async (fileName: string): Promise<void> => {
  try {
    if (!supabase) return;

    const { error } = await supabase.storage.from(bucketName).remove([fileName]);
    if (error) throw error;
  } catch (error: any) {
    logger.error(`Error deleting from Supabase: ${error.message}`);
  }
};

export default supabase;
