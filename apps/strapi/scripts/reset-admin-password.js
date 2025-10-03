// Quick script to reset admin password
// Usage: node scripts/reset-admin-password.js

const { createStrapi } = require('@strapi/strapi');

async function resetAdminPassword() {
  const strapi = await createStrapi().load();

  const newEmail = process.env.ADMIN_EMAIL || 'admin@handywriterz.com';
  const newPassword = process.env.ADMIN_PASSWORD || 'NewPassword123!';

  try {
    // Get first admin user
    const admins = await strapi.db.query('admin::user').findMany({
      limit: 1,
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found in database');
      process.exit(1);
    }

    const admin = admins[0];
    console.log('Found admin:', admin.email);

    // Update admin
    await strapi.db.query('admin::user').update({
      where: { id: admin.id },
      data: {
        email: newEmail,
        password: newPassword,
        blocked: false,
        isActive: true,
      },
    });

    console.log('\n✅ Admin credentials updated!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', newEmail);
    console.log('Password:', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nLogin at:');
    console.log('https://ahandywriterz-production.up.railway.app/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }

  await strapi.destroy();
  process.exit(0);
}

resetAdminPassword();
