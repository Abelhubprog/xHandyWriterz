const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi({ distDir: './dist' }).load();
  
  const email = process.argv[2] || 'abelngeno1@gmail.com';
  const newPassword = process.argv[3] || 'TempPass123!';
  
  try {
    console.log(`🔍 Looking for admin user: ${email}`);
    
    // Find the admin user
    const user = await strapi.db.query('admin::user').findOne({ 
      where: { email } 
    });
    
    if (!user) {
      console.error(`❌ Admin user ${email} not found`);
      console.log('📋 Available admin users:');
      const allUsers = await strapi.db.query('admin::user').findMany();
      allUsers.forEach(u => console.log(`  - ${u.email} (ID: ${u.id})`));
      process.exit(1);
    }
    
    console.log(`✅ Found admin user: ${user.firstname} ${user.lastname} (${user.email})`);
    
    // Hash the new password using Strapi's auth service
    const hashedPassword = await strapi.service('admin::auth').hashPassword(newPassword);
    
    // Update the password and ensure user is active
    await strapi.db.query('admin::user').update({
      where: { id: user.id },
      data: { 
        password: hashedPassword, 
        isActive: true,
        blocked: false
      }
    });
    
    console.log('');
    console.log('✅ ===============================================');
    console.log('✅ PASSWORD RESET SUCCESSFUL!');
    console.log('✅ ===============================================');
    console.log('');
    console.log(`👤 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log('🌐 Login URL: https://handywriterz-production-production.up.railway.app/admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after logging in!');
    console.log('   Go to: Settings → Profile → Change Password');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.destroy();
    process.exit(0);
  }
})();
