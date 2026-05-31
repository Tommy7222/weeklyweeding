-- Run this in your Supabase SQL Editor to create the signups table

CREATE TABLE signups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow the API to insert rows
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert from API" ON signups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated" ON signups
  FOR SELECT USING (true);
