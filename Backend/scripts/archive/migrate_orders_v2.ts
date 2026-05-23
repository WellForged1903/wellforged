import pool from './src/config/db.js';

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log("Starting DB Migration V2...");
        
        // Profiles updates
        await client.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT, ADD COLUMN IF NOT EXISTS role TEXT DEFAULT "customer";');
        
        // Orders updates (redundant safety)
        await client.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS address_snapshot JSONB,
            ADD COLUMN IF NOT EXISTS subtotal INTEGER,
            ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_payment',
            ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
            ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
            ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
        `);

        // Order Items updates
        await client.query('ALTER TABLE order_items ADD COLUMN IF NOT EXISTS item_total INTEGER;');

        console.log("Migration V2 successful!");
    } catch (err) {
        console.error("Migration V2 failed:", err);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
