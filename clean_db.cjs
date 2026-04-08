const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_8K3zuQnWJOyt@ep-empty-morning-acco7g3l-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected.");
    await client.query('TRUNCATE TABLE "Movimiento" CASCADE;');
    await client.query('TRUNCATE TABLE "Insumo" CASCADE;');
    console.log("Truncated successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}
run();
