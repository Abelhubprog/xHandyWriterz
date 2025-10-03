const { spawn } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const nodeBinary = process.execPath;
const strapiBin = require.resolve('@strapi/strapi/bin/strapi.js', { paths: [projectRoot] });

const params = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  firstname: process.env.ADMIN_FIRSTNAME || 'Admin',
  lastname: process.env.ADMIN_LASTNAME || 'User',
};

console.log('Creating Strapi admin user with:');
console.log(  email: );
console.log(  firstname: );
console.log(  lastname: );

const args = [
  strapiBin,
  'admin:create-user',
  '--email',
  params.email,
  '--password',
  params.password,
  '--firstname',
  params.firstname,
  '--lastname',
  params.lastname,
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
    console.log('Admin user created successfully.');
  }
  process.exit(code ?? 0);
});
