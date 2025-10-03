const { spawn } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const nodeBinary = process.execPath;
const strapiBin = require.resolve('@strapi/strapi/bin/strapi.js', { paths: [projectRoot] });

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'NewPassword123!';

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be provided.');
  process.exit(1);
}

console.log(`Resetting Strapi admin password for ${email}`);

const args = [
  strapiBin,
  'admin:reset-user-password',
  '--email',
  email,
  '--password',
  password,
];

const child = spawn(nodeBinary, args, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    FORCE_COLOR: '0',
  },
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('Admin password reset complete.');
  }
  process.exit(code ?? 0);
});
