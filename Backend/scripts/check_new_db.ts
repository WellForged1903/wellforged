import pool from '../src/config/db.js';

const EXPECTED_TABLES = [
  'profiles',
  'addresses',
  'categories',
  'products',
  'skus',
  'product_images',
  'product_metadata',
  'faqs',
  'cart_items',
  'coupons',
  'orders',
  'order_items',
  'payments',
  'report_batches',
  'report_test_results',
  'product_reviews'
];

const checkDatabase = async () => {
  const client = await pool.connect();
  console.log("==================================================");
  console.log("🔌 WELLFORGED DATABASE DIAGNOSTIC UTILITY");
  console.log("==================================================");
  
  try {
    // 1. Connection check
    const timeRes = await client.query('SELECT NOW()');
    console.log(`✅ Connection Successful!`);
    console.log(`📅 DB Server Time: ${timeRes.rows[0].now}\n`);

    // 2. Fetch all public tables and row counts
    console.log("📊 Table Row Counts:");
    for (const table of EXPECTED_TABLES) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`  - [OK] ${table}: ${countRes.rows[0].count} rows`);
      } catch (e: any) {
        console.log(`  - [ERROR] ${table}: Table missing or query failed`);
      }
    }

  } catch (err: any) {
    console.error("\n❌ DATABASE CONNECTION OR QUERY FAILED:");
    console.error(err.message);
  } finally {
    client.release();
    process.exit();
  }
};

checkDatabase();
