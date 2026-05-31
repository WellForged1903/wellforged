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

// Datasets for Generating Natural Indian Profiles
const firstNamesMale = [
  'Amit', 'Rajesh', 'Vikram', 'Suresh', 'Sanjay', 'Anil', 'Sunil', 'Sandeep', 
  'Rahul', 'Manoj', 'Rohit', 'Ajay', 'Vijay', 'Deepak', 'Dinesh', 'Arun', 
  'Harish', 'Ramesh', 'Alok', 'Ashish', 'Gaurav', 'Saurav', 'Pawan', 'Mahesh', 
  'Ravi', 'Nitin', 'Kapil', 'Manish', 'Aditya', 'Anuj', 'Vivek', 'Pranav'
];

const firstNamesFemale = [
  'Priya', 'Sunita', 'Neha', 'Ritu', 'Anita', 'Deepa', 'Shweta', 'Pooja', 
  'Meena', 'Jyoti', 'Kavita', 'Kiran', 'Aarti', 'Sangeeta', 'Anjali', 'Geeta', 
  'Rekha', 'Sneha', 'Payal', 'Divya', 'Nisha', 'Rupa', 'Sapna', 'Swati', 
  'Preeti', 'Richa', 'Pallavi', 'Rashi', 'Shivani', 'Komal', 'Tanvi', 'Megha'
];

const lastNames = [
  'Sharma', 'Gupta', 'Patel', 'Verma', 'Singh', 'Kumar', 'Rao', 'Iyer', 
  'Nair', 'Joshi', 'Mehta', 'Shah', 'Reddy', 'Sen', 'Bose', 'Das', 'Roy', 
  'Mishra', 'Pandey', 'Choudhury', 'Saxena', 'Trivedi', 'Kapoor', 'Khanna', 
  'Yadav', 'Prasad', 'Saini', 'Gill', 'Bhat', 'Kulkarni', 'Deshmukh', 'Pillai'
];

// Natural Comment Templates categorized by rating
const comments5Star = [
  "This is by far the freshest moringa powder I have tried in India. The bright green color itself tells the story of gentle processing. Will order again!",
  "Highly impressed by the transparency. I verified the batch number WF-202605-001 on their portal and saw the actual NABL lab report. Clean and pure supplement.",
  "Excellent quality! It doesn't have any sand or grit which is common in cheaper local brands. Earthy taste is strong but that is proof of purity.",
  "Daily green smoothies are incomplete without this. Gives a sustained energy boost throughout the day. Very happy with WellForged sourcing.",
  "You can feel the quality difference. It dissolves beautifully in warm water. Packaging is very premium and airtight. Truly export grade.",
  "Highly recommended. Sourced from Tamil Nadu red soil, high iron content is exactly what my nutritionist suggested for my hemoglobin levels.",
  "Very clean flavor. Yes, it is slightly bitter but that's how authentic raw moringa leaves taste. No added sugar or fillers. Highly recommend.",
  "Premium packaging, quick delivery in Delhi. Checked the heavy metal test parameters in the COA and they are way below international limits. Safe product.",
  "Amazing product! I take a teaspoon in the morning with lemon water. My digestion has improved significantly in 3 weeks. Genuine quality.",
  "Finest moringa available online in India. The shade-dried leaves color is vibrant green. Support was also helpful when I asked for report details.",
  "No fillers, no colors, pure product. I love that they perform NABL testing for every single batch instead of showing one old certificate.",
  "My energy levels have improved a lot. I mix it with curd or dal. It is incredibly versatile and very rich in vitamins. Worth the price.",
  "Genuine single-origin moringa powder. The smell is fresh and grassy, not stale or musty. Excellent product by WellForged.",
  "Superb quality. I have gifted a pouch to my parents too. Cleanest moringa in the market with verified lab analysis.",
  "Fast shipping to Bangalore. Airtight zipper lock is fantastic. Purity verified! Best dietary supplement for daily immunity booster."
];

const comments4Star = [
  "Very good quality moringa powder. Fresh smell and authentic bitter taste. Only feedback is the delivery took 4 days to Pune. Otherwise perfect.",
  "Great product, highly pure. I mix it in my morning juice. Deduced 1 star because the zipper lock of the pouch is a bit tight to close. Product is 5/5.",
  "Authentic and lab verified. The batch report is online which is amazing. It is quite earthy in taste but very healthy. Good packaging.",
  "Love the transparency reports. The color is deep green and fresh. Packaging is top-notch. Took some time to get used to the bitter herbal taste.",
  "No grit or artificial smell. Extremely fine powder. Mixing it in warm water works best. Wish they had a bigger 500g economy pack.",
  "Product is brilliant. Clean and tested. Shipping was slightly delayed by the courier, but the support team helped track it instantly.",
  "Using it for a month now. Definitely helps with fatigue. Natural product and no synthetic junk inside. Happy customer."
];

const comments3Star = [
  "The product is good and fresh, but the earthy smell is too strong for my liking. Had to mix it in spicy buttermilk to drink it.",
  "Very bitter in taste, hard to drink with plain water. But I guess pure moringa is supposed to be bitter. Lab report is good though.",
  "Delivery was delayed by almost 5 days. Product quality is fine and fresh, but shipping service needs to be improved.",
  "Average experience. The powder is very fine, but it forms small lumps when mixed in cold water. Works better in warm water.",
  "Product is authentic but a bit expensive compared to regular market options. Purity is good but price could be slightly lower."
];

const comments2Star = [
  "Taste is extremely bitter and strong. I tried it for 3 days but couldn't continue due to the flavor. Sourcing and reports are good, but not for me.",
  "Earthy smell is quite overwhelming. The color is green and fresh but the flavor makes it very difficult to consume regularly. Zipper pouch also tore slightly."
];

const comments1Star = [
  "Too bitter and strong grassy flavor. It gave me a bit of an upset stomach on the first day. Maybe I took too much, but not suited for my body.",
  "The package arrived completely damaged in transit and some powder leaked inside the box. Customer support refunded it immediately though. Disappointed with shipping."
];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomName() {
  const isMale = Math.random() > 0.5;
  const firstName = isMale ? getRandomElement(firstNamesMale) : getRandomElement(firstNamesFemale);
  const lastName = getRandomElement(lastNames);
  return `${firstName} ${lastName}`;
}

// Generate random date between Jan 1, 2026 and May 31, 2026
function generateRandomDate() {
  const start = new Date('2026-01-01T00:00:00Z').getTime();
  const end = new Date('2026-05-31T23:59:59Z').getTime();
  const randomTimestamp = start + Math.random() * (end - start);
  return new Date(randomTimestamp).toISOString();
}

async function seedReviews() {
  console.log('Connecting to database...');
  await client.connect();

  try {
    // 1. Get Product ID for Moringa Powder
    const productRes = await client.query("SELECT id FROM products WHERE slug = 'moringa-powder' LIMIT 1");
    if (productRes.rows.length === 0) {
      throw new Error("Product 'moringa-powder' not found in database! Make sure products are seeded first.");
    }
    const productId = productRes.rows[0].id;
    console.log(`Found Moringa Powder Product UUID: ${productId}`);

    // 2. Clear existing reviews to ensure clean 281 count
    console.log('Clearing old reviews...');
    await client.query("DELETE FROM reviews WHERE product_id = $1", [productId]);

    // 3. Define target review array to seed
    const reviewsToSeed = [];

    // Target mathematically exact counts:
    // 5 Stars: 230
    // 4 Stars: 40
    // 3 Stars: 7
    // 2 Stars: 2
    // 1 Star:  2
    // Total:   281
    // Average: 1337 / 281 = 4.758 (Rounds to 4.8)

    const targets = [
      { rating: 5, count: 230, templates: comments5Star },
      { rating: 4, count: 40, templates: comments4Star },
      { rating: 3, count: 7, templates: comments3Star },
      { rating: 2, count: 2, templates: comments2Star },
      { rating: 1, count: 2, templates: comments1Star }
    ];

    console.log('Generating 281 Indian reviews with exact star counts...');
    
    // Set of generated names to avoid exact duplicates
    const usedNames = new Set();

    for (const target of targets) {
      for (let i = 0; i < target.count; i++) {
        let name = generateRandomName();
        while (usedNames.has(name)) {
          name = generateRandomName();
        }
        usedNames.add(name);

        const comment = getRandomElement(target.templates);
        const created_at = generateRandomDate();
        
        // 95% of reviews are marked as verified purchases
        const is_verified_purchase = Math.random() < 0.95;

        reviewsToSeed.push({
          product_id: productId,
          customer_name: name,
          rating: target.rating,
          comment: comment,
          is_verified_purchase,
          status: 'published',
          created_at
        });
      }
    }

    // 4. Batch insert reviews
    console.log(`Inserting ${reviewsToSeed.length} reviews...`);
    
    for (const r of reviewsToSeed) {
      await client.query(`
        INSERT INTO reviews (product_id, customer_name, rating, comment, is_verified_purchase, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [r.product_id, r.customer_name, r.rating, r.comment, r.is_verified_purchase, r.status, r.created_at]);
    }

    // Verify rating average & count
    const verifyRes = await client.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(rating) as total_stars,
        AVG(rating) as avg_rating
      FROM reviews 
      WHERE product_id = $1
    `, [productId]);

    const stats = verifyRes.rows[0];
    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log(`Total Reviews Seeded : ${stats.total_count}`);
    console.log(`Total Star Points    : ${stats.total_stars}`);
    console.log(`Mathematical Average : ${parseFloat(stats.avg_rating).toFixed(4)}`);
    console.log(`Display Rating (Rnd) : ${parseFloat(stats.avg_rating).toFixed(1)}`);
    console.log('=============================================\n');

  } catch (err) {
    console.error('Error during reviews seeding:', err.message);
  } finally {
    await client.end();
  }
}

seedReviews();
