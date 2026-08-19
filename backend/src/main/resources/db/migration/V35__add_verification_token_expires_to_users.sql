ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

UPDATE users
SET verification_token_expires = created_at + INTERVAL '24 hours'
WHERE verification_token IS NOT NULL
  AND verification_token_expires IS NULL;
