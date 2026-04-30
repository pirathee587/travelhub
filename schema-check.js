const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.gzkohtgqtpbscczxuaaj:TJHPE@B23UOM@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require',
});

async function run() {
  await client.connect();
  let res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'hotels';
  `);
  console.log("Hotels Columns:");
  console.log(res.rows);
  await client.end();
}
run().catch(console.error);
