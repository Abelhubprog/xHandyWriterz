// Script to create a new admin user in production
// Run this via Railway CLI: railway run node scripts/create-admin.js

const strapi = require('@strapi/strapi');

async function createAdmin() {
  const app = await strapi().load();

  const params = {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    firstname: process.env.ADMIN_FIRSTNAME || 'Admin',
    lastname: process.env.ADMIN_LASTNAME || 'User',
    blocked: false,
    isActive: true,
  };

  console.log('Creating admin user with email:', params.email);

  try {
    // Check if admin already exists
    const admins = await strapi.query('admin::user').findMany();
    console.log('Existing admins:', admins.length);

    if (admins.length > 0) {
      console.log('Admin already exists. Updating password...');
      const admin = admins[0];

      await strapi.query('admin::user').update({
        where: { id: admin.id },
        data: {
          password: params.password,
          email: params.email,
        },
      });

      console.log('✅ Admin password updated successfully!');
      console.log('Email:', params.email);
    } else {
      console.log('Creating new admin...');
      const superAdminRole = await strapi.query('admin::role').findOne({
        where: { code: 'strapi-super-admin' },
      });

      await strapi.query('admin::user').create({
        data: {
          ...params,
          roles: [superAdminRole.id],
        },
      });

      console.log('✅ Admin created successfully!');
    }

    console.log('\nLogin credentials:');
    console.log('Email:', params.email);
    console.log('Password:', params.password);
    console.log('\nLogin at: https://ahandywriterz-production.up.railway.app/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

createAdmin();
