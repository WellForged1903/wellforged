import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ...(process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1' && {
        ssl: { rejectUnauthorized: false }
    })
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running Order Migration...');
        
        await client.query('BEGIN');
        
        // Add tracking_number
        await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255);');
        console.log('✅ Added tracking_number');
        
        // Add courier_partner
        await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_partner VARCHAR(100);');
        console.log('✅ Added courier_partner');
        
        await client.query('COMMIT');
        console.log('🎉 Migration Successful!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
