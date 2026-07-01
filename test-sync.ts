import { getOrCreateUser } from './src/db/queries.ts';

async function run() {
  try {
    const user = await getOrCreateUser("JzO3XWjQxpae61PWU5vby75eIIl1", "modernizetech.oficial@gmail.com", "Diego Henrique", "");
    console.log("User:", user);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}
run();
