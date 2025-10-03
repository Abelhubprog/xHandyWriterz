// Check existing admin users
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi({ distDir: './dist' }).load();
  
  try {
    console.log('🔍 Checking for existing admin users...\n');
    
    const users = await strapi.db.query('admin::user').findMany();
    
    if (users.length === 0) {
      console.log('❌ No admin users found in database');
      console.log('✅ You can proceed with registration via the web UI');
    } else {
      console.log(`✅ Found ${users.length} admin user(s):\n`);
      users.forEach((user, index) => {
        console.log(`Admin ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  First Name: ${user.firstname}`);
        console.log(`  Last Name: ${user.lastname}`);
        console.log(`  Active: ${user.isActive}`);
        console.log(`  Blocked: ${user.blocked || false}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await app.destroy();
    process.exit(0);
  }
})();
