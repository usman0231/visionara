# ⚠️ CRITICAL: Fix Database Connection Pool Error

## The Error You're Seeing:

```
MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

## Root Cause:

You're using **Supabase Session Mode pooler** which has a strict connection limit (usually 3-5 connections). This is **NOT suitable for serverless environments** like Vercel or applications with multiple concurrent requests.

## ✅ SOLUTION: Switch to Transaction Mode Pooler

### Step 1: Get Your Transaction Mode Connection String

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection Pooling** section
5. You'll see two connection strings:
   - **Session Mode** (Port 5432) - ❌ This is what you're currently using
   - **Transaction Mode** (Port 6543) - ✅ Use this instead

### Step 2: Update Your .env.local (Localhost)

Open `.env.local` and update your `DATABASE_URL`:

**Old (Session Mode - Port 5432):**
```bash
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

**New (Transaction Mode - Port 6543):**
```bash
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

**The only change is the port number: 5432 → 6543**

### Step 3: Update Vercel Environment Variables

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project (visionara)
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` and click **Edit**
5. Update the port from `5432` to `6543`
6. Save and **redeploy** your project

### Step 4: Restart Development Server

```bash
# Stop your current dev server (Ctrl+C)
# Then restart it
npm run dev
```

## Why Transaction Mode?

| Feature | Session Mode (Port 5432) | Transaction Mode (Port 6543) |
|---------|-------------------------|------------------------------|
| **Max Connections** | 3-5 (very limited) | 10,000+ (excellent for serverless) |
| **Best For** | Long-lived connections | Short-lived, serverless functions |
| **Vercel Compatible** | ❌ NO | ✅ YES |
| **Connection Pooling** | Limited | Excellent |
| **Cost** | Same | Same (no extra cost) |

## What I Fixed in the Code:

1. **Reduced Connection Pool Sizes:**
   - Serverless (Vercel): 1 connection per function
   - Localhost: 3 connections max
   - CLI (migrations): 2 connections max

2. **Added Connection Caching:**
   - Schema checks now cache for 1 minute
   - Reduces repeated database queries on login page

3. **Improved Connection Management:**
   - Connections are properly released after use
   - No connection leaks

## Verification Steps:

After switching to Transaction Mode:

1. **Test Localhost:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/backoffice/login
   # Should load without errors
   ```

2. **Test Migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   # Should complete without "max clients" error
   ```

3. **Test Vercel:**
   - Push your code to GitHub
   - Vercel will auto-deploy
   - Visit your live site's `/backoffice/login`
   - Should work perfectly

## Still Having Issues?

If you're still seeing errors after switching to Transaction Mode:

1. **Clear all connections:**
   ```bash
   node scripts/close-db-connections.js
   ```

2. **Check your connection string:**
   - Make sure port is `6543`
   - Make sure you copied the FULL string from Supabase
   - Check for typos

3. **Restart everything:**
   ```bash
   # Stop dev server
   # Clear Next.js cache
   rm -rf .next
   # Restart
   npm run dev
   ```

## Summary:

**The key change:** Port `5432` → `6543`

That's it! This single change will fix all your connection pool issues on both localhost and Vercel.
