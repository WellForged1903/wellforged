import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function main() {
    console.log('Connecting to PostgreSQL database for re-seeding...');
    await client.connect();

    try {
        console.log('Truncating all tables in cascade order...');
        await client.query(`
            TRUNCATE TABLE 
                reviews, 
                payments, 
                order_items, 
                orders, 
                cart_items, 
                report_test_results, 
                report_batches, 
                product_metadata, 
                product_images, 
                faqs,
                skus, 
                products, 
                categories, 
                grievance_tickets, 
                profiles 
            CASCADE;
        `);
        console.log('Tables truncated successfully.');

        console.log('Seeding profiles...');
        await client.query(`
            INSERT INTO profiles (full_name, email, phone, role) VALUES 
            ('Ayush Admin', 'admin@wellforged.in', '9999999999', 'admin');
        `);

        console.log('Seeding categories...');
        await client.query(`
            INSERT INTO categories (name, slug, description) VALUES 
            ('Superfoods', 'superfoods', 'Clean, single-ingredient superfoods crafted for performance.');
        `);

        console.log('Seeding products...');
        await client.query(`
            INSERT INTO products (category_id, name, slug, base_description, is_active) VALUES (
                (SELECT id FROM categories WHERE slug = 'superfoods' LIMIT 1),
                'Moringa Powder',
                'moringa-powder',
                'Pure, nutrient-rich moringa powder — lab tested, no fillers, nothing hidden. Sourced from the finest farms and cold-processed to preserve maximum potency.',
                true
            );
        `);

        console.log('Seeding SKUs...');
        await client.query(`
            INSERT INTO skus (id, product_id, sku_code, label, price, original_price, stock) VALUES
            ('a4c4e78a-c603-4fde-99c5-846101d2938b', (SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF-MOR-100', '100g Pouch', 349, 499, 150),
            ('394df525-89e4-49cc-86ba-0e6673971d17', (SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF-MOR-250', '250g Pouch', 549, 899, 80);
        `);

        console.log('Seeding product images...');
        await client.query(`
            INSERT INTO product_images (product_id, image_url, is_main, display_order) VALUES 
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), '/Packaging_Updated.png', true, 1);
        `);

        console.log('Seeding product metadata...');
        await client.query(`
            INSERT INTO product_metadata (product_id, category, key, value, icon_name, display_order) VALUES
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'highlight', 'Lab Tested', 'Third-party tested', 'FlaskConical', 1),
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'highlight', 'No Fillers', 'Pure moringa leaf powder', 'ShieldCheck',  2),
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'spec', 'Protein', '27g per 100g', NULL, 1),
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'spec', 'Iron', '28mg per 100g', NULL, 2);
        `);

        console.log('Seeding FAQs...');
        await client.query(`
            INSERT INTO faqs (product_id, question, answer, is_active, display_order) VALUES
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'How do I consume this?', 'Mix 1 tsp (3g) in water, smoothies, or any beverage.', true, 1),
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'Is it safe during pregnancy?', 'Consult your physician before consuming any supplement.', true, 2);
        `);

        console.log('Seeding lab report batches...');
        await client.query(`
            INSERT INTO report_batches (product_id, batch_number, testing_date, tested_by, mfg_date, exp_date) VALUES 
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF2026021212', '2026-02-12', 'ABC Analytical Labs', '2026-02-10', '2028-02-10'),
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'WF-202605-001', '2026-05-15', 'NABL Certified Quality Lab', '2026-05-01', '2028-05-01');
        `);

        console.log('Seeding lab report test results...');
        await client.query(`
            INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status, safe_limit)
            SELECT id, test_name, test_value, unit, pass_status, safe_limit FROM report_batches, (VALUES
                ('Heavy Metals (Lead)',    'Not Detected', 'ppm',  true, '< 1.5 ppm'),
                ('Microbial Count',        'Pass',         '',     true, '< 10,000 cfu/g'),
                ('Pesticides Screening',   'Non-Detected', '',     true, 'Zero Contamination')
            ) AS data(test_name, test_value, unit, pass_status, safe_limit)
            WHERE report_batches.batch_number = 'WF2026021212';
        `);

        await client.query(`
            INSERT INTO report_test_results (batch_id, test_name, test_value, unit, pass_status, safe_limit)
            SELECT id, test_name, test_value, unit, pass_status, safe_limit FROM report_batches, (VALUES
                ('Heavy Metals (Lead)',    'Not Detected', 'ppm',  true, '< 1.5 ppm'),
                ('Heavy Metals (Mercury)', 'Not Detected', 'ppm',  true, '< 0.5 ppm'),
                ('Microbial Count',        'Pass',         '',     true, '< 10,000 cfu/g'),
                ('Pesticides Screening',   'Non-Detected', '',     true, 'Zero Contamination'),
                ('Potency Verification',   '99.9%',        '%',    true, '> 95% Active Moringa')
            ) AS data(test_name, test_value, unit, pass_status, safe_limit)
            WHERE report_batches.batch_number = 'WF-202605-001';
        `);

        console.log('Seeding reviews...');
        await client.query(`
            INSERT INTO reviews (product_id, customer_name, rating, comment, is_verified_purchase, status) VALUES 
            ((SELECT id FROM products WHERE slug='moringa-powder' LIMIT 1), 'Verified Customer', 5, 'The taste is incredibly fresh. Highly recommend!', true, 'published');
        `);

        console.log('Seeding grievance tickets...');
        await client.query(`
            INSERT INTO grievance_tickets (ticket_id, customer_name, email, phone, order_number, category, description, attachment_url, status, resolution_notes, resolved_at) VALUES
            ('WF-TKT-382904', 'John Doe', 'john.doe@example.com', '+91 99999 88888', 'WF-170284', 'Delivery Delays', 'My parcel is delayed for more than 5 days. Please expedite.', NULL, 'pending', NULL, NULL),
            ('WF-TKT-894012', 'Suresh Kumar', 'suresh.k@gmail.com', '+91 98765 43210', 'WF-170305', 'Sourcing & Lab Reports', 'I need the comprehensive NABL report for the fresh batch.', NULL, 'pending', NULL, NULL),
            ('WF-TKT-281034', 'Anita Sharma', 'anita.sharma@yahoo.com', '+91 99887 76655', 'WF-170299', 'Payment Failures', 'My card was charged twice for a single order. Refund the duplicate.', NULL, 'resolved', 'Duplicate transaction has been identified and refunded successfully to your card. Txn Ref: Refund-984021.', CURRENT_TIMESTAMP);
        `);

        console.log('Database successfully re-seeded with clean, correct data!');
    } catch (err) {
        console.error('Error during database re-seeding:', err);
    } finally {
        await client.end();
    }
}

main();
