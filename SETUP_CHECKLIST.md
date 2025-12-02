# Property Creation Setup Checklist

## ✅ What's Already Done

1. ✅ API Route created (`src/app/api/properties/route.ts`)
2. ✅ Supabase admin client (`src/lib/supabase-admin.ts`)
3. ✅ Cloudinary server helper (`src/lib/cloudinary-server.ts`)
4. ✅ Zod validation schema (`src/lib/validations/property-create.ts`)
5. ✅ SQL migration file (`supabase/migrations/001_create_properties_table.sql`)

## 🔴 What Needs to be Done

### 1. Environment Variables Setup

Create/update `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Where to find:**
- **Supabase**: Dashboard → Settings → API → Project URL & Service Role Key
- **Cloudinary**: Dashboard → Settings → Access Keys

### 2. Run SQL Migration in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_create_properties_table.sql`
3. Paste and run the migration
4. Verify table was created: Dashboard → Table Editor → Should see `properties` table

### 3. Update PropertyFormPage to Call API

**Current Issue**: Form has `TODO: Save to Supabase` comment and just logs data.

**What needs to change:**
- Store File objects, not just blob URLs
- Convert Plate editor JSON to plain text
- Map form fields to API fields (`area` → `area_sqm`)
- Call `/api/properties` endpoint with FormData
- Handle loading/error states

### 4. Field Name Mappings

The form uses different field names than the API expects:

| Form Field | API Field | Action |
|------------|-----------|--------|
| `area` | `area_sqm` | ✅ Map in form submission |
| `description` (JSON) | `description` (text) | ✅ Convert Plate JSON to text |
| `year_built` | `build_year` | ✅ Map in form submission |
| `completion_status` | `completion_degree` | ✅ Map in form submission |

### 5. Image Handling

**Current Issue**: Form stores blob URLs but API needs File objects.

**Solution**: Store File objects in a ref alongside URLs for preview.

### 6. Description Conversion

**Current Issue**: Plate editor stores description as JSON, but API expects plain text.

**Solution**: Extract plain text from Plate JSON structure.

## 🚀 Implementation Steps

1. ✅ Update form to store File objects
2. ✅ Create helper to convert Plate JSON to text
3. ✅ Update onSubmit to call API with FormData
4. ✅ Map field names correctly
5. ✅ Add loading/error states
6. ✅ Test with actual Supabase/Cloudinary credentials

## 📝 Testing Checklist

After setup:
- [ ] Environment variables set
- [ ] SQL migration run successfully
- [ ] Form submits data correctly
- [ ] Images upload to Cloudinary
- [ ] Property saved to Supabase
- [ ] Error handling works
- [ ] Loading states display properly










