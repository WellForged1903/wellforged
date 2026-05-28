import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

const articles = [
    {
        title: "How to Audit a Supplement Brand: A Guide to Reading Lab Reports",
        slug: "reading-lab-reports",
        category: "Science",
        read_time: "6 min read",
        excerpt: "Supplement labels can lie, but third-party lab reports don't. Learn how to verify NABL certifications, decode heavy metal thresholds, and spot common filler tricks.",
        content: `
            <h2>The Transparency Illusion</h2>
            <p>Walk down any wellness aisle and you'll find labels shouting terms like "organic," "pure," and "100% natural." Yet, in the supplement industry, a label is only as honest as the laboratory test that verifies it. To truly understand what you are putting in your body, you must learn to audit supplement brands through their third-party laboratory reports.</p>
            
            <blockquote>"A brand's trust isn't built on its front-label marketing; it's verified in its back-end laboratory certifications."</blockquote>
            
            <h2>1. Look for the NABL Logo & Accreditation</h2>
            <p>First and foremost, inspect who conducted the test. In India, look for laboratory reports accredited by the **National Accreditation Board for Testing and Calibration Laboratories (NABL)**, which is under the International Laboratory Accreditation Cooperation (ILAC). If a report is self-certified or issued by a non-accredited private laboratory, treat it with caution.</p>
            
            <h2>2. Decoding Heavy Metal ppm (Parts Per Million)</h2>
            <p>Heavy metals occur naturally in the soil, which means trace amounts are common in herbal botanicals. However, industrial harvesting often introduces toxic concentrations. The key metals to watch are:</p>
            <ul>
                <li><strong>Lead (Pb):</strong> Safety limits are strictly monitored. A clean supplement should show results far below the legal threshold (typically &lt; 1.5 ppm, with premium sourcing displaying "Not Detected").</li>
                <li><strong>Arsenic (As):</strong> High exposure damages cell replication. Safe limits are generally &lt; 1.0 ppm.</li>
                <li><strong>Cadmium (Cd):</strong> A toxic metal that accumulates in the kidneys. Limits should remain &lt; 0.3 ppm.</li>
                <li><strong>Mercury (Hg):</strong> Exceptionally toxic to the nervous system. Safe limits are &lt; 0.1 ppm.</li>
            </ul>
            
            <h2>3. Spotting Filler & Adulteration Tricks</h2>
            <p>Many botanical powders (like Moringa or Wheatgrass) are diluted with cheap maltodextrin, starch, or grass clippings to increase product weight. NABL reports test for <strong>Purity and Botanical Identification</strong>. Always check the testing date against the packaging batch number printed on your jar—they must match exactly to verify the authenticity of that specific batch.</p>
            
            <div style="background-color: #f7f3ea; padding: 20px; border-radius: 12px; border-left: 4px solid #23503D; margin: 24px 0;">
                <strong>The WellForged Standard:</strong> Every batch of our Moringa powder is cold-processed on the same day it is harvested, tested by Eurofins NABL labs, and fully published online. Scan your package's QR code to verify your specific batch's parameters instantly.
            </div>
        `,
        image_url: "/Packaging_Updated.png"
    },
    {
        title: "Moringa Oleifera: The Chemistry of the World's Most Nutrient-Dense Botanical",
        slug: "moringa-chemistry",
        category: "Sourcing",
        read_time: "5 min read",
        excerpt: "Moringa is more than a wellness trend. Discover the bioactive compounds, terroir factors, and fresh cold-processing methods that separate premium moringa from industrial grade.",
        content: `
            <h2>More Than a Superfood</h2>
            <p>While Moringa has recently surged in global popularity as a "superfood," it has been valued in Ayurvedic medicine for thousands of years. But what does modern biochemical analysis tell us about this remarkable tree? Let's take a look under the microscope at the molecular structure of <em>Moringa oleifera</em>.</p>
            
            <h2>1. The Power of Chlorophyll and Isothiocyanates</h2>
            <p>Moringa's deep green color is a visual representation of its high <strong>chlorophyll</strong> concentration, which acts as a powerful cellular antioxidant. More importantly, Moringa leaves are rich in **Isothiocyanates**—specifically <em>moringinin</em>. These bioactive compounds are highly researched for their anti-inflammatory pathways, helping to reduce systemic inflammation at a cellular level.</p>
            
            <h2>2. Why Sourcing Terroir Matters</h2>
            <p>The nutrient profile of Moringa isn't identical across the globe. Botanicals absorb the characteristics of the soil they are grown in—a concept known in agriculture as <strong>terroir</strong>. Moringa cultivated in the semi-arid, iron-rich red soil of Southern India (such as Tamil Nadu) yields significantly higher concentrations of bioactive nutrients, iron, and calcium compared to crops grown in standard industrial soil.</p>
            
            <h2>3. The Oxidation Race: Harvest to Package</h2>
            <p>Once picked, fresh Moringa leaves degrade rapidly. Heat, sunlight, and air oxidize the delicate leaves, causing them to lose up to 60% of their nutrient density within 24 hours. Industrial supplement brands often pool harvests for days, drying them using high-heat ovens. Premium sourcing mandates <strong>fresh cold-processing</strong>: harvesting in the early morning, shade-drying at low temperatures within hours, and immediately packaging in light-blocked pouches to lock in molecular integrity.</p>
            
            <div style="background-color: #f7f3ea; padding: 20px; border-radius: 12px; border-left: 4px solid #23503D; margin: 24px 0;">
                Our single-origin Tamil Nadu farms shade-dry every leaf at low temperatures below 40°C to preserve cellular structure, guaranteeing high-grade, premium bioactive powders with zero heat degradation.
            </div>
        `,
        image_url: "/Packaging_Updated.png"
    },
    {
        title: "Clean Supplements vs. Industrial Formulations: Why Zero-Fillers Matter",
        slug: "clean-supplements-vs-industrial",
        category: "Nutrition",
        read_time: "7 min read",
        excerpt: "Most supplement brands rely on flow agents, fillers, and stabilizers to speed up machinery. Find out why zero-additive sourcing is crucial for modern wellness.",
        content: `
            <h2>The Hidden Ingredients in Wellness</h2>
            <p>When you buy a supplement, you look at the "Active Ingredients" to see what nutrients you're getting. But what about the "Other Ingredients" list printed at the bottom in tiny font? In the world of industrial supplement manufacturing, standard pills and powders are packed with additives that serve the machinery, not your health.</p>
            
            <h2>1. Flow Agents and Lubricants: Magnesium Stearate</h2>
            <p>To speed up production, manufacturers need powders to flow smoothly through encapsulating machines without sticking. To achieve this, they add lubricants like **Magnesium Stearate** or **Silicon Dioxide** (sand). While considered safe in microscopic quantities, these flow agents offer zero nutritional value and can form a biofilm in the digestive tract, hindering the biological absorption of the actual nutrients.</p>
            
            <h2>2. Bulking Fillers and Binding Agents</h2>
            <p>Active vitamins or botanical extracts often represent only a fraction of a capsule's volume. To fill the remaining space, brands pack capsules with bulking agents like microcrystalline cellulose, starch, or cheap lactose. For customers with sensitive digestive systems, these fillers can lead to bloating, micro-inflammation, or allergic reactions.</p>
            
            <h2>3. The Clean Alternative: Zero-Additive Sourcing</h2>
            <p>Zero-additive manufacturing is slow, expensive, and requires premium machinery tuned specifically for pure botanicals. However, the benefits are clear:
            <ul>
                <li><strong>Radical Purity:</strong> 100% active compounds. No binders, synthetic stabilizers, or chemical preservatives.</li>
                <li><strong>Maximum Bioavailability:</strong> Without flow agents coating your stomach lining, your body absorbs nutrients naturally and efficiently.</li>
                <li><strong>Zero Allergen Risks:</strong> Perfect for individuals with auto-immune or gut-sensitivity profiles.</li>
            </ul>
            </p>
            
            <div style="background-color: #f7f3ea; padding: 20px; border-radius: 12px; border-left: 4px solid #23503D; margin: 24px 0;">
                <strong>WellForged Sourcing Integrity:</strong> We refuse to compromise. We pack only 100% pure botanical powders with zero additives, flow agents, or chemical preservatives. Every single milligram you ingest is active, traceable nutrition.
            </div>
        `,
        image_url: "/Packaging_Updated.png"
    }
];

async function runMigration() {
    console.log('Connecting to PostgreSQL wellforgedtest for Phase 2 migration...');
    await client.connect();

    try {
        console.log('Creating blog_posts table if it does not exist...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title        VARCHAR(255) NOT NULL,
                slug         VARCHAR(255) NOT NULL UNIQUE,
                excerpt      TEXT NOT NULL,
                content      TEXT NOT NULL,
                category     VARCHAR(100) NOT NULL DEFAULT 'Nutrition',
                read_time    VARCHAR(50) NOT NULL DEFAULT '5 min read',
                author       VARCHAR(100) NOT NULL DEFAULT 'WellForged Editorial',
                image_url    TEXT,
                created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('blog_posts table verified successfully.');

        console.log('Creating high-speed slug index...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
        `);

        console.log('Seeding SEO-optimized articles...');
        for (const a of articles) {
            await client.query(`
                INSERT INTO blog_posts (title, slug, category, read_time, excerpt, content, image_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (slug) DO UPDATE 
                SET title = EXCLUDED.title,
                    category = EXCLUDED.category,
                    read_time = EXCLUDED.read_time,
                    excerpt = EXCLUDED.excerpt,
                    content = EXCLUDED.content,
                    image_url = EXCLUDED.image_url;
            `, [a.title, a.slug, a.category, a.read_time, a.excerpt, a.content, a.image_url]);
            console.log(`Seeded article: "${a.title}"`);
        }

        console.log('Phase 2 database migration and seeding successfully complete!');
    } catch (err) {
        console.error('Error during database migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
