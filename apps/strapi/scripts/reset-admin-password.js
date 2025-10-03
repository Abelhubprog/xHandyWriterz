const { execSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'NewPassword123!';

if (!email || !password) {
  console.error('Usage: node reset-admin-password.js <email> <password>');
  console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
  process.exit(1);
}

console.log(`Resetting Strapi admin password for ${email}`);

try {
  // Use npx to run the strapi CLI command
  execSync(
    `npx strapi admin:reset-user-password --email="${email}" --password="${password}"`,
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: '0',
      },
    }
  );
  console.log('\n✅ Admin password reset complete!');
  console.log(`Email: ${email}`);
  console.log('You can now log in with the new password.');
} catch (error) {
  console.error('❌ Failed to reset password:', error.message);
  process.exit(1);
}
