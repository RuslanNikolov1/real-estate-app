# 🔴 URGENT FIX: localhost Redirect Issue

## Problem
When logging in with Google, you're being redirected to:
```
http://localhost:3000/?code=...
```
Instead of your production domain.

## Root Cause
Your Supabase dashboard has `localhost:3000` configured as the Site URL, so Supabase redirects there even in production.

## ✅ Quick Fix Checklist

### Step 1: Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: **mixusdsnrsiazvbtypja** (from your .env file)

### Step 2: Fix Site URL
1. Navigate to: **Authentication** → **URL Configuration**
   - Or: **Settings** → **Auth** → **URL Configuration**
2. Find the **Site URL** field
3. **Change it from:**
   ```
   http://localhost:3000
   ```
   **To your production domain:**
   ```
   https://your-production-domain.com
   ```
   (Replace with your actual production domain, e.g., `https://brokerbulgaria.bg`)

### Step 3: Add Production Redirect URL
1. Scroll to **Redirect URLs** section
2. Click **+ ADD URL** or the **+** button
3. Add your production callback URL:
   ```
   https://your-production-domain.com/auth/callback
   ```
4. **Remove** any localhost URLs from the list if they exist:
   - ❌ Remove: `http://localhost:3000/auth/callback`
   - ❌ Remove: `https://localhost:3000/auth/callback`
5. **Keep only production URLs:**
   - ✅ Keep: `https://your-production-domain.com/auth/callback`

### Step 4: Save Changes
- Click **Save** at the bottom
- Changes take effect immediately (no deployment needed)

### Step 5: Test
1. Clear your browser cache and cookies
2. Open your production site (not localhost)
3. Try logging in with Google
4. Check browser console (F12) - you should see debug logs showing the correct origin

## What Your Supabase Settings Should Look Like

**Site URL:**
```
https://your-production-domain.com
```

**Redirect URLs:**
```
https://your-production-domain.com/auth/callback
```

**NOT:**
- ❌ `http://localhost:3000`
- ❌ `https://localhost:3000`
- ❌ `http://127.0.0.1:3000`

## Still Not Working?

1. **Check browser console** (F12) for the debug logs:
   - Look for "=== Google OAuth Debug ==="
   - Verify "Current origin" shows your production domain
   - Verify "Full redirect URL" shows your production domain

2. **Verify environment variables** in your deployment platform:
   - `NEXT_PUBLIC_SUPABASE_URL` should be: `https://mixusdsnrsiazvbtypja.supabase.co`
   - Make sure it's set in production (Vercel, etc.), not just locally

3. **Double-check Supabase dashboard:**
   - Site URL = production domain (not localhost)
   - Redirect URLs includes production callback (not localhost)
   - Both use `https://` (not `http://`)

4. **Clear everything:**
   - Browser cache
   - Cookies for your site
   - Try in incognito/private window

## Your Supabase Project Info

From your `.env` file:
- **Project Reference ID:** `mixusdsnrsiazvbtypja`
- **Supabase URL:** `https://mixusdsnrsiazvbtypja.supabase.co`

Make sure your production domain is configured in the Supabase dashboard, not localhost!
