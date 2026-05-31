import pg from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Client } = pg;
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432')
});

async function verifyReviews() {
  console.log('Connecting to database for verification...');
  await client.connect();

  try {
    const productRes = await client.query("SELECT id FROM products WHERE slug = 'moringa-powder' LIMIT 1");
    if (productRes.rows.length === 0) {
      throw new Error("Product 'moringa-powder' not found!");
    }
    const productId = productRes.rows[0].id;

    // Get aggregated reviews statistics
    const statsRes = await client.query(`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(rating) as total_stars,
        AVG(rating) as average_rating,
        MIN(created_at) as earliest_review,
        MAX(created_at) as latest_review
      FROM reviews
      WHERE product_id = $1
    `, [productId]);

    const stats = statsRes.rows[0];

    // Get stars breakout
    const breakoutRes = await client.query(`
      SELECT rating, COUNT(*) as count 
      FROM reviews 
      WHERE product_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [productId]);

    console.log('\n========= VERIFICATION RESULTS =========');
    console.log(`Total Reviews Found   : ${stats.total_reviews}`);
    console.log(`Sum of Star Ratings   : ${stats.total_stars}`);
    console.log(`Average Star Rating   : ${parseFloat(stats.average_rating).toFixed(4)}`);
    console.log(`Display Rating (Rnd)  : ${parseFloat(stats.average_rating).toFixed(1)}`);
    console.log(`Earliest Review Date  : ${stats.earliest_review}`);
    console.log(`Latest Review Date    : ${stats.latest_review}`);
    console.log('----------------------------------------');
    console.log('Star Breakout:');
    
    let sumCheck = 0;
    let countCheck = 0;

    for (const row of breakoutRes.rows) {
      const rating = parseInt(row.rating);
      const count = parseInt(row.count);
      sumCheck += rating * count;
      countCheck += count;
      console.log(`  ${rating} Stars: ${count} reviews`);
    }

    console.log('----------------------------------------');
    
    // Assertions
    let errors = [];
    if (countCheck !== 281) {
      errors.push(`Error: Expected exactly 281 reviews, found ${countCheck}.`);
    }
    
    const calculatedAvg = sumCheck / countCheck;
    if (calculatedAvg < 4.75 || calculatedAvg > 4.77) {
      errors.push(`Error: Average is ${calculatedAvg.toFixed(4)}, expected ~4.76.`);
    }

    const startLimit = new Date('2026-01-01T00:00:00Z');
    const endLimit = new Date('2026-05-31T23:59:59Z');
    const earliest = new Date(stats.earliest_review);
    const latest = new Date(stats.latest_review);

    if (earliest < startLimit || latest > endLimit) {
      errors.push(`Error: Review dates out of bounds [Jan 1, 2026 - May 31, 2026]. Earliest: ${stats.earliest_review}, Latest: ${stats.latest_review}`);
    }

    // Check a sample of customer names to ensure they look Indian
    const sampleNamesRes = await client.query(`
      SELECT customer_name FROM reviews 
      WHERE product_id = $1 
      LIMIT 10
    `, [productId]);

    console.log('\nSample Indian Customer Names:');
    for (const row of sampleNamesRes.rows) {
      console.log(`  - ${row.customer_name}`);
    }

    if (errors.length === 0) {
      console.log('\n✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
      console.log('Database state is exactly correct and matches specifications perfectly.\n');
    } else {
      console.log('\n❌ VERIFICATION FAILED WITH ERRORS:');
      for (const err of errors) {
        console.log(`  - ${err}`);
      }
      console.log('\n');
    }

  } catch (err) {
    console.error('Verification Error:', err.message);
  } finally {
    await client.end();
  }
}

verifyReviews();
