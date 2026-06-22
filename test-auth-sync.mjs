import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/sync',
  method: 'POST',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', data));
});
req.end();
