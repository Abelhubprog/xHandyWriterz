// Simple password reset using direct database connection
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const email = process.argv[2] || 'abelngeno1@gmail.com';
const newPassword = process.argv[3] || 'dunnyYOH#9';

async function resetPassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if user exists
    const checkResult = await client.query(
      'SELECT id, firstname, lastname, email, is_active FROM admin_users WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length === 0) {
      console.error(`❌ Admin user ${email} not found`);
      
      // Show all admin users
      const allUsers = await client.query('SELECT id, email FROM admin_users');
      console.log('📋 Available admin users:');
      allUsers.rows.forEach(u => console.log(`  - ${u.email} (ID: ${u.id})`));
      process.exit(1);
    }

    const user = checkResult.rows[0];
    console.log(`✅ Found user: ${user.firstname} ${user.lastname} (${user.email})`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔐 Password hashed');

    // Update the password
    await client.query(
      'UPDATE admin_users SET password = $1, is_active = true, blocked = false WHERE email = $2',
      [hashedPassword, email]
    );

    console.log('');
    console.log('✅ ===============================================');
    console.log('✅ PASSWORD RESET SUCCESSFUL!');
    console.log('✅ ===============================================');
    console.log('');
    console.log(`👤 Email: ${email}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log('🌐 Login: https://handywriterz-production-production.up.railway.app/admin');
    console.log('');
    console.log('⚠️  CHANGE THIS PASSWORD after logging in!');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetPassword();
