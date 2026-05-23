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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        is_verified_purchase BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'published',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Add some initial dummy reviews for the moringa powder
    const res = await pool.query(`SELECT id FROM products WHERE slug = 'moringa-powder' LIMIT 1;`);
    if (res.rows.length > 0) {
      const productId = res.rows[0].id;
      
      // Check if reviews already exist
      const checkRes = await pool.query(`SELECT count(*) FROM reviews WHERE product_id = $1`, [productId]);
      if (parseInt(checkRes.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO reviews (product_id, customer_name, rating, comment, is_verified_purchase) VALUES 
          ($1, 'Rahul S.', 5, 'Incredible quality. I have tried many brands but this Moringa powder actually gives me sustained energy without the crash.', true),
          ($1, 'Priya K.', 5, 'Mixes perfectly into my morning smoothies. Love that it is single origin and lab tested.', true),
          ($1, 'Arjun M.', 4, 'Very potent and fresh. The earthy taste takes some getting used to, but the health benefits are undeniable.', false)
        `, [productId]);
        console.log('Reviews table created and seeded with initial reviews.');
      } else {
        console.log('Reviews table created. Initial reviews already exist.');
      }
    } else {
       console.log('Reviews table created. No product found to seed initial reviews.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
