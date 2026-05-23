import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function main() {
  try {
    await pool.query('UPDATE skus SET price = 1 WHERE sku_code = $1', ['WF-MOR-100']);
    await pool.query('UPDATE skus SET price = 2 WHERE sku_code = $1', ['WF-MOR-250']);
    console.log('Prices successfully updated to Rs 1 and Rs 2 for live testing.');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
