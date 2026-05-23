-- =============================================================
-- WellForged Full Database Migration (Supabase Ready) 
-- UUID + Backend Safe Version
-- =============================================================

-- Enable UUID extension (Required for Supabase/PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS report_test_results CASCADE;
DROP TABLE IF EXISTS report_batches CASCADE;
DROP TABLE IF EXISTS faqs CASCADE;
DROP TABLE IF EXISTS product_metadata CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS skus CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =============================================================
-- 1. PROFILES
-- =============================================================
CREATE TABLE profiles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name   VARCHAR(200),
    email       VARCHAR(255) UNIQUE,
    phone       VARCHAR(20) UNIQUE NOT NULL,
    role        VARCHAR(20) DEFAULT 'customer',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 2. ADDRESSES
-- =============================================================
CREATE TABLE addresses (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name      VARCHAR(200) NOT NULL,
    mobile_number  VARCHAR(20) NOT NULL,
    address_line1  TEXT NOT NULL,
    address_line2  TEXT,
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    pincode        VARCHAR(20) NOT NULL,
    is_default     BOOLEAN DEFAULT false,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 3. CATEGORIES
-- =============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 4. PRODUCTS
-- =============================================================
CREATE TABLE products (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) UNIQUE NOT NULL,
    base_description TEXT,
    is_active        BOOLEAN DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 5. SKUs (Variants)
-- =============================================================
CREATE TABLE skus (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
    sku_code       VARCHAR(100) UNIQUE NOT NULL,
    label          VARCHAR(100) NOT NULL,
    price          INTEGER NOT NULL, -- Matched to Backend
    original_price INTEGER,
    weight_grams   INTEGER DEFAULT 0, -- For shipping calculation
    stock          INTEGER DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 6. PRODUCT IMAGES
-- =============================================================
CREATE TABLE product_images (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url     TEXT NOT NULL,
    is_main       BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 7. PRODUCT METADATA
-- =============================================================
CREATE TABLE product_metadata (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
    category      VARCHAR(50) NOT NULL,
    key           VARCHAR(255) NOT NULL,
    value         TEXT,
    icon_name     VARCHAR(100),
    display_order INTEGER DEFAULT 0
);

-- =============================================================
-- 8. FAQs
-- =============================================================
CREATE TABLE faqs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    is_active     BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0
);

-- =============================================================
-- 9. CART ITEMS
-- =============================================================
CREATE TABLE cart_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sku_id     UUID REFERENCES skus(id) ON DELETE CASCADE,
    quantity   INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, sku_id)
);

-- =============================================================
-- 10. COUPONS
-- =============================================================
CREATE TABLE coupons (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50) UNIQUE NOT NULL,
    discount_type       VARCHAR(20) DEFAULT 'fixed',
    discount_value      INTEGER NOT NULL,
    max_discount_amount INTEGER,
    min_order_value     INTEGER,
    expires_at          TIMESTAMP WITH TIME ZONE,
    max_uses            INTEGER DEFAULT 1000,
    used_count          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 11. ORDERS (Includes ALL Razorpay Updates)
-- =============================================================
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        VARCHAR(100) UNIQUE NOT NULL,
    profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
    address_snapshot    JSONB NOT NULL,
    coupon_id           UUID REFERENCES coupons(id) ON DELETE SET NULL,
    subtotal            INTEGER NOT NULL,
    discount_amount     INTEGER DEFAULT 0,
    total_amount        INTEGER NOT NULL,
    payment_status      VARCHAR(50) DEFAULT 'pending_payment', -- Upgraded default
    fulfillment_status  VARCHAR(50) DEFAULT 'pending',
    idempotency_key     VARCHAR(100) UNIQUE,
    razorpay_order_id   VARCHAR(255), -- RAZORPAY LINK
    razorpay_payment_id VARCHAR(255), -- RAZORPAY LINK
    shipping_carrier    VARCHAR(100), -- E.g., Delhivery, BlueDart
    tracking_number     VARCHAR(100), -- AWB Number
    tracking_url        TEXT,
    shipped_at          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 12. ORDER ITEMS
-- =============================================================
CREATE TABLE order_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id   UUID REFERENCES orders(id) ON DELETE CASCADE,
    sku_id     UUID REFERENCES skus(id) ON DELETE SET NULL,
    quantity   INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    item_total INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 13. PAYMENTS
-- =============================================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID REFERENCES orders(id) ON DELETE CASCADE,
    payment_method      VARCHAR(50),
    amount              INTEGER NOT NULL,
    status              VARCHAR(50) DEFAULT 'captured',
    raw_response        JSONB, -- RAZORPAY WEBHOOK DATA
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 14. TRANSPARENCY: REPORT BATCHES
-- =============================================================
CREATE TABLE report_batches (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id     UUID REFERENCES products(id) ON DELETE CASCADE,
    batch_number   VARCHAR(100) NOT NULL,
    testing_date   DATE,
    tested_by      VARCHAR(255),
    lab_report_url TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, batch_number)
);

-- =============================================================
-- 15. TRANSPARENCY: TEST RESULTS
-- =============================================================
CREATE TABLE report_test_results (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id    UUID REFERENCES report_batches(id) ON DELETE CASCADE,
    test_name   VARCHAR(255) NOT NULL,
    test_value  VARCHAR(100) NOT NULL,
    unit        VARCHAR(50),
    pass_status BOOLEAN DEFAULT true,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_to ON public.coupons(expires_at);

-- REVIEWS TABLE (DYNAMIC SOCIAL PROOF)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);


-- =============================================================
-- SEED DATA (Now fully compatible with UUID system)
-- =============================================================

INSERT INTO profiles (full_name, email, phone, role) VALUES 
('Ayush Admin', 'admin@wellforged.in', '9999999999', 'admin');

INSERT INTO categories (name, slug, description) VALUES 
('Superfoods', 'superfoods', 'Clean, single-ingredient superfoods crafted for performance.');

INSERT INTO products (category_id, name, slug, base_description, is_active) VALUES (
    (SELECT id FROM categories WHERE slug = 'superfoods' LIMIT 1),
    'Moringa Powder',
    'moringa-powder',
    'Pure, nutrient-rich moringa powder — lab tested, no fillers, nothing hidden. Sourced from the finest farms and cold-processed to preserve maximum potency.',
    true
);

INSERT INTO skus (product_id, sku_code, label, price, original_price, stock) VALUES
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF-MOR-100', '100g Pouch', 349, 499, 150),
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF-MOR-250', '250g Pouch', 549, 899, 80);

INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES 
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), '/Packaging_Updated.png', true, 1);

INSERT INTO product_metadata (product_id, category, key, value, icon_name, display_order) VALUES
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'highlight', 'Lab Tested', 'Third-party tested', 'FlaskConical', 1),
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'highlight', 'No Fillers', 'Pure moringa leaf powder', 'ShieldCheck',  2),
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'spec', 'Protein', '27g per 100g', NULL, 1),
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'spec', 'Iron', '28mg per 100g', NULL, 2);

INSERT INTO faqs (product_id, question, answer, is_active, display_order) VALUES
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'How do I consume this?', 'Mix 1 tsp (3g) in water, smoothies, or any beverage.', true, 1),
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'Is it safe during pregnancy?', 'Consult your physician before consuming any supplement.', true, 2);

INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by) VALUES 
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF2026021212', '2026-02-12', 'ABC Analytical Labs');

INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status)
SELECT id, test_name, test_value, unit, pass_status FROM report_batches, (VALUES
    ('Heavy Metals (Lead)',    'Not Detected', 'ppm',  true),
    ('Microbial Count',        'Pass',         '',     true)
) AS data(test_name, test_value, unit, pass_status)
WHERE report_batches.batch_number = 'WF2026021212';

INSERT INTO coupons (code, discount_type, discount_value, min_order_value, expires_at, max_uses, used_count, is_active) VALUES
('SAVE20', 'fixed', 20, 349, '2026-12-31 23:59:59+05:30', 1000, 0, true),
('SAVE50', 'fixed', 50, 890, '2026-12-31 23:59:59+05:30', 1000, 0, true);

INSERT INTO reviews (product_id, customer_name, rating, comment, is_verified_purchase, status) VALUES 
((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'Verified Customer', 5, 'The taste is incredibly fresh. Highly recommend!', true, 'published');
