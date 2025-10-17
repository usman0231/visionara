require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function closeAllConnections() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get current database name
    const dbResult = await client.query('SELECT current_database()');
    const currentDb = dbResult.rows[0].current_database;

    console.log(`📊 Current database: ${currentDb}`);

    // Terminate all connections except the current one
    const terminateQuery = `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1
        AND pid <> pg_backend_pid()
        AND usename = current_user;
    `;

    const result = await client.query(terminateQuery, [currentDb]);
    console.log(`✅ Terminated ${result.rowCount} connections`);

    // Show remaining connections
    const countQuery = `
      SELECT count(*) as active_connections
      FROM pg_stat_activity
      WHERE datname = $1;
    `;

    const countResult = await client.query(countQuery, [currentDb]);
    console.log(`📊 Active connections: ${countResult.rows[0].active_connections}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('✅ Disconnected from database');
  }
}

closeAllConnections();
