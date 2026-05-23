import pool from './src/config/db.js';

const searchLocalhost = async () => {
  const client = await pool.connect();
  try {
    console.log("Searching for 'localhost' in all text/jsonb columns...");
    const tablesResult = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (data_type IN ('text', 'character varying') OR data_type = 'jsonb');
    `);

    for (const row of tablesResult.rows) {
      const { table_name, column_name } = row;
      try {
        const query = `SELECT id, "${column_name}" FROM "${table_name}" WHERE "${column_name}"::text LIKE '%localhost:%' LIMIT 5;`;
        const matches = await client.query(query);
        if (matches.rows.length > 0) {
          console.log(`Found matches in table: ${table_name}, column: ${column_name}`);
          console.log(JSON.stringify(matches.rows, null, 2));
        }
      } catch (e) {
        // Skip tables without 'id' or other issues
      }
    }
  } catch (err) {
    console.error("Search failed:", err);
  } finally {
    client.release();
    process.exit();
  }
};

searchLocalhost();
