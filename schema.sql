CREATE TABLE IF NOT EXISTS requests (
  request_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved')),
  created_at TEXT NOT NULL,
  access_code TEXT UNIQUE,
  approved_at TEXT,
  redeemed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_access_code ON requests(access_code);
