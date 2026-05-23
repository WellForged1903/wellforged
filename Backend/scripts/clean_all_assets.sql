-- Database cleanup script to remove stale localhost absolute URLs
-- This script permanently replaces absolute localhost URLs with relative paths.

-- 1. Product Images
UPDATE product_images 
SET image_url = REGEXP_REPLACE(image_url, '^https?://(localhost|127\.0\.0\.1|::1)(:\d+)?', '', 'i')
WHERE image_url ~* '^https?://(localhost|127\.0\.0\.1|::1)';

-- 2. Product Metadata Icons
UPDATE product_metadata 
SET icon_name = REGEXP_REPLACE(icon_name, '^https?://(localhost|127\.0\.0\.1|::1)(:\d+)?', '', 'i')
WHERE icon_name ~* '^https?://(localhost|127\.0\.0\.1|::1)';

-- 3. Batch Reports
-- Check if report_batches has any URL fields. Based on audit, report_batches has batch_number etc. 
-- If any other fields like report_pdf_url exist, update them too.
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_batches' AND column_name = 'report_pdf_url') THEN
        UPDATE report_batches 
        SET report_pdf_url = REGEXP_REPLACE(report_pdf_url, '^https?://(localhost|127\.0\.0\.1|::1)(:\d+)?', '', 'i')
        WHERE report_pdf_url ~* '^https?://(localhost|127\.0\.0\.1|::1)';
    END IF;
END $$;

-- 4. Products Metadata (JSONB)
-- For the JSONB field, we use a more complex update to replace strings inside JSON
-- Wrapping in DO block in case the column name differs or doesn't exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'metadata') THEN
        UPDATE products
        SET metadata = metadata_json_cleaned.val
        FROM (
            SELECT id, 
                   REGEXP_REPLACE(metadata::text, 'https?://(localhost|127\.0\.0\.1|::1)(:\d+)?', '', 'g')::jsonb as val
            FROM products
        ) as metadata_json_cleaned
        WHERE products.id = metadata_json_cleaned.id
        AND products.metadata::text ~* 'https?://(localhost|127\.0\.0\.1|::1)';
    END IF;
END $$;

-- 5. Profiles (Avatar URLs)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        UPDATE profiles 
        SET avatar_url = REGEXP_REPLACE(avatar_url, '^https?://(localhost|127\.0\.0\.1|::1)(:\d+)?', '', 'i')
        WHERE avatar_url ~* '^https?://(localhost|127\.0\.0\.1|::1)';
    END IF;
END $$;
