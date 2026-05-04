import psycopg2

conn = psycopg2.connect(
    host="aws-1-ap-southeast-1.pooler.supabase.com",
    port=6543,
    user="postgres.gzkohtgqtpbscczxuaaj",
    password="TJHPE@B23UOM",
    dbname="postgres",
    sslmode="require"
)
cur = conn.cursor()

# Create table
cur.execute("""
CREATE TABLE IF NOT EXISTS review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    CONSTRAINT fk_review_images_review 
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
""")

# Create index
cur.execute("CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);")

# Add columns
try:
    cur.execute("ALTER TABLE reviews ADD COLUMN user_name VARCHAR(255);")
except Exception as e:
    print(f"Skipped user_name: {e}")
    conn.rollback()

try:
    cur.execute("ALTER TABLE reviews ADD COLUMN title VARCHAR(255);")
except Exception as e:
    print(f"Skipped title: {e}")
    conn.rollback()

conn.commit()
cur.close()
conn.close()
print("DB Fix applied!")
