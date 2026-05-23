import pool from './src/config/db.js';

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log("Starting DB Migration...");
        
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

        // Change current_status default or rename if needed. 
        // For now, let's keep it compatible.
        
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
