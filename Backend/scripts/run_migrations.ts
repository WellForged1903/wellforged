import pool from '../src/config/db.js';

const runMigrations = async () => {
  const client = await pool.connect();
  console.log("==========================================");
  console.log("🛠️ RUNNING DATABASE SCHEMA MIGRATIONS");
  console.log("==========================================");

  try {
    console.log("Adding columns to report_batches...");
    await client.query(`
      ALTER TABLE report_batches 
      ADD COLUMN IF NOT EXISTS mfg_date DATE,
      ADD COLUMN IF NOT EXISTS exp_date DATE;
    `);
    console.log("✅ report_batches table altered successfully.");

    console.log("Adding column to report_test_results...");
    await client.query(`
      ALTER TABLE report_test_results 
      ADD COLUMN IF NOT EXISTS safe_limit VARCHAR(100);
    `);
    console.log("✅ report_test_results table altered successfully.");

    console.log("==========================================");
    console.log("🎉 ALL SCHEMA MIGRATIONS COMPLETED SUCCESSFULLY");
    console.log("==========================================");
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message || err);
    process.exit(1);
  } finally {
    client.release();
    process.exit();
  }
};

runMigrations();
