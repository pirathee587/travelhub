const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.gzkohtgqtpbscczxuaaj:TJHPE@B23UOM@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require',
});

async function run() {
  await client.connect();
  try {
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS agent_id BIGINT;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS start_place VARCHAR(255);`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS end_place VARCHAR(255);`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_from DOUBLE PRECISION;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS price_to DOUBLE PRECISION;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS review_count INTEGER;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS festival_details TEXT;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT FALSE;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS inclusions TEXT;`);
    await client.query(`ALTER TABLE packages ADD COLUMN IF NOT EXISTS application_status VARCHAR(255) DEFAULT 'Pending';`);
    
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS review_count INTEGER;`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS number_of_rooms INTEGER;`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS owner_email VARCHAR(255);`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS owner_nic VARCHAR(255);`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS nic_image_url VARCHAR(255);`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone_number VARCHAR(255);`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS hotline_number VARCHAR(255);`);
    await client.query(`ALTER TABLE hotels ADD COLUMN IF NOT EXISTS application_status VARCHAR(255) DEFAULT 'Pending';`);

    await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_id BIGINT;`);
    await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_id BIGINT;`);
    await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;`);
    
    console.log("Successfully added all required missing columns back to Supabase");
  } catch (e) {
    console.error(e);
  }
  await client.end();
}
run().catch(console.error);
