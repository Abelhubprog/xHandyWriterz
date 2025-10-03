const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const saltRounds = 10;

(async () => {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('===== NEW BCRYPT HASH =====');
    console.log(hash);
    console.log('===========================');
  } catch (err) {
    console.error('Error:', err);
  }
})();
