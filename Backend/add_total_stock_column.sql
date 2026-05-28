ALTER TABLE skus ADD COLUMN IF NOT EXISTS total_stock INTEGER DEFAULT 0;
UPDATE skus SET total_stock = stock WHERE total_stock = 0 OR total_stock IS NULL;
