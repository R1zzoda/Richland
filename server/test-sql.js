// test-sql-new.js
const { Client } = require('pg');

async function testDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 4200,
    database: 'Richland',
    user: 'postgres',
    password: 'lamb'
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');

    // Используем уникальный email
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    console.log('👤 Creating test user...');
    const insertResult = await client.query(`
      INSERT INTO "User" (email, password, username) 
      VALUES ($1, $2, $3) 
      RETURNING id, email, username, "createdAt"
    `, [uniqueEmail, '123456', 'testuser']);

    console.log('✅ User created:', insertResult.rows[0]);

    // Получаем всех пользователей
    const users = await client.query('SELECT * FROM "User"');
    console.log('📋 All users in database:');
    users.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Username: ${user.username}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

testDatabase();