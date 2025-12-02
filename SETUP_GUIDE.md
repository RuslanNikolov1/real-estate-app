# Complete Setup Guide for Property Creation

## 📋 Overview

To make property creation fully functional, you need to:

1. **Set up environment variables**
2. **Run SQL migration in Supabase**
3. **Update frontend form to call API** (I'll do this now)
4. **Test the complete flow**

## 🔧 Step 1: Environment Variables

Add to `.env.local`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cloudinary (Required)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Where to find these:**

### Supabase:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **KEEP SECRET!**

### Cloudinary:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Dashboard → Settings → Access Keys
3. Copy:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET` ⚠️ **KEEP SECRET!**

## 🗄️ Step 2: Run SQL Migration

1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Open `supabase/migrations/001_create_properties_table.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Verify:
   - Go to Table Editor
   - You should see `properties` table
   - Check that all columns exist

## 🔌 Step 3: Frontend Integration

I'll update the `PropertyFormPage` component to:
- Store File objects (not just URLs)
- Call the `/api/properties` endpoint
- Map field names correctly
- Convert Plate editor JSON to plain text
- Handle loading/error states

## ✅ Step 4: Testing

After setup, test:

1. Fill out the property form
2. Upload at least 1 image
3. Submit the form
4. Check:
   - ✅ Success message appears
   - ✅ Redirects to properties list
   - ✅ Images appear in Cloudinary dashboard
   - ✅ Property appears in Supabase `properties` table

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify variable names match exactly (case-sensitive)
- Restart dev server: `npm run dev`

### Error: "Failed to create property"
- Check Supabase table exists
- Verify RLS policies allow inserts (or service role is used)
- Check browser console for detailed error

### Images not uploading
- Verify Cloudinary credentials
- Check image size (max 8MB)
- Verify image file type (must be image/*)

### Field mapping errors
- Check that form fields match API expectations
- Verify `area` → `area_sqm` mapping
- Check `build_year` field name










