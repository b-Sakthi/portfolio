-- Cloudflare D1 Schema for Portfolio Contact System & Admin Inbox
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Replied', 'Closed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON contact_messages (status, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_replies (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  client_reply_id TEXT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES contact_messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_replies_message_created
  ON admin_replies (message_id, created_at ASC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_replies_idempotency
  ON admin_replies (message_id, client_reply_id)
  WHERE client_reply_id IS NOT NULL;
