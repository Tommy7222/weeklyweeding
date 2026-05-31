# Weekly Weeding — Deployment Guide

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
