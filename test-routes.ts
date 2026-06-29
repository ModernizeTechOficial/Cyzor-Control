import fetch from 'node-fetch';

async function testRoute(route: string) {
  try {
    const res = await fetch(`http://localhost:3000${route}`);
    const text = await res.text();
    console.log(`${route} -> Status: ${res.status}, Type: ${res.headers.get('content-type')}`);
    if (res.status === 200 && text.startsWith('<!doctype')) {
      console.log(`  WARNING: Returned HTML!`);
    } else if (res.status === 404) {
      console.log(`  404 JSON: ${text.substring(0, 50)}...`);
    } else {
      console.log(`  Response: ${text.substring(0, 50)}...`);
    }
  } catch (err: any) {
    console.error(`  Error: ${err.message}`);
  }
}

async function main() {
  await testRoute('/api/health');
  await testRoute('/api/notifications');
  await testRoute('/api/companies');
  await testRoute('/api/not-found');
}
main();
