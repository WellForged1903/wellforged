import pool from '../src/config/db.js';

const TABLES = [
  'profiles', 'categories', 'products', 'skus', 
  'product_images', 'product_metadata', 'faqs', 
  'report_batches', 'report_test_results', 'coupons', 
  'product_reviews', 'orders'
];

const checkCounts = async () => {
  const client = await pool.connect();
  console.log("==========================================");
  console.log("📊 WELLFORGED TABLE ROW COUNT DIAGNOSTIC");
  console.log("==========================================");

  try {
    for (const table of TABLES) {
      const res = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      const count = res.rows[0].count;
      console.log(`  - ${table}: ${count} rows`);
    }
  } catch (err: any) {
    console.error("Diagnostic failed:", err.message);
  } finally {
    client.release();
    process.exit();
  }
};

checkCounts();
