# Weekly Weeding — Deployment Guide

## Environment Variables (add these in Vercel)
SUPABASE_URL=https://oqcbufsrasugcujjdmmf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xY2J1ZnNyYXN1Z2N1ampkbW1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzA5ODQsImV4cCI6MjA5NTgwNjk4NH0.7jKgBuq3C2BpE7Z9kVoevTIBN_HLV63YMkfMQv6WyAM
RESEND_API_KEY=re_EBR6qUK1_K6y3oDWjbK7LBMfANyUVgXAy

## Step 1 — Create Supabase Table
1. Go to Supabase dashboard
2. Click SQL Editor on the left
3. Paste the contents of setup.sql
4. Click Run

## Step 2 — Deploy to Vercel
1. Push this folder to a GitHub repo called weeklyweeding
2. Import that repo in Vercel
3. Add the environment variables above in Vercel Project Settings → Environment Variables
4. Deploy!

## Step 3 — Add Custom Domain
1. In Vercel go to Project Settings → Domains
2. Add weeklyweeding.com
3. Update DNS in Namecheap with the records Vercel provides
