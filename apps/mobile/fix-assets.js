const fs = require('fs');
const b = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('assets/icon.png', b);
fs.writeFileSync('assets/splash-icon.png', b);
fs.writeFileSync('assets/adaptive-icon.png', b);
fs.writeFileSync('assets/favicon.png', b);
console.log('Assets created successfully', fs.statSync('assets/icon.png').size + ' bytes');