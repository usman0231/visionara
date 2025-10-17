# Database Connection Pool Fix

## Problem
Error: `MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size`

This error occurs when using **Supabase Session Mode** pooler, which has strict connection limits.

## Solution Applied

### 1. Reduced Connection Pool Sizes

**For Vercel (Serverless):**
- `max: 1` - Only 1 connection per serverless function
- `min: 0` - No minimum connections
- `idle: 1000ms` - Close idle connections quickly
- `evict: 1000ms` - Check for idle connections every second

**For Localhost:**
- `max: 3` - Reduced from 5 (was causing Supabase limits)
- `min: 0` - No minimum connections
- `idle: 10000ms` - Keep connections alive longer

**For CLI (migrations/seeders):**
- `max: 2` - Only 2 connections for database operations

## Additional Fix: Use Transaction Mode (Recommended)

If you're using **Supabase**, you should switch to **Transaction Mode** pooler for serverless:

### How to Switch to Transaction Mode:

1. **Go to Supabase Dashboard** → Your Project → Settings → Database
2. **Find "Connection Pooling"** section
3. **Copy the "Transaction" mode connection string** (port 6543)
4. **Update your `.env.local`:**

```bash
# Replace your current DATABASE_URL with the Transaction mode pooler
# Should look like: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DATABASE_URL="your-transaction-pooler-url-here"
```

### Why Transaction Mode?

- **Session Mode**: Limited to pool_size connections, better for long-lived connections
- **Transaction Mode**: Supports up to 10,000 concurrent connections, perfect for serverless

## Files Modified

1. `lib/db/sequelize.ts` - Added serverless detection and dynamic pool config
2. `lib/db/config.js` - Reduced CLI pool size to 2 connections

## Testing

After updating, test your connection:

**Localhost:**
```bash
npm run dev
# Try logging into /backoffice
```

**Database Operations:**
```bash
npm run db:migrate
npm run db:seed
```

## Vercel Deployment

Make sure to set `DATABASE_URL` in Vercel environment variables:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your Transaction mode pooler URL
3. Redeploy

## Connection String Format

**Session Mode (Port 5432):**
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

**Transaction Mode (Port 6543) - Recommended:**
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## If Issues Persist

1. Check Supabase pool size limits in dashboard
2. Ensure all old connections are closed (restart dev server)
3. Check Supabase logs for connection errors
4. Consider upgrading Supabase plan for more connections
