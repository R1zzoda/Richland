// cleanup-test-data.js
const { Client } = require('pg');

async function cleanup() {
  const client = new Client({
    host: 'localhost',
    port: 4200,
    database: 'Richland',
    user: 'postgres',
    password: 'lamb'
  });

  try {
    await client.connect();

    const result = await client.query(
      'DELETE FROM "User" WHERE email LIKE $1',
      ['test%']
    );

    console.log(`✅ Removed ${result.rowCount} test users`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanup();
