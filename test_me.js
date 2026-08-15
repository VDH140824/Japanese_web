const crypto = require('crypto');
const http = require('http');

const issuedAt = Date.now();
const expiresAt = issuedAt + 86400000;
const username = 'hungvu140804@gmail.com';
const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
const payload = Buffer.from(`{"sub":"${username}","iat":${issuedAt},"exp":${expiresAt}}`).toString('base64url');
const content = `${header}.${payload}`;
const secret = 'change-me-secret-change-me-secret';
const signature = crypto.createHmac('sha256', secret).update(content).digest('base64url');
const token = `${content}.${signature}`;

console.log("Token:", token);

const req = http.request({
  hostname: 'localhost',
  port: 8080,
  path: '/api/users/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log("Response:", body));
});

req.end();
