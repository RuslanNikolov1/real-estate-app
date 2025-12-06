# Property Creation API Documentation

## Overview

This API endpoint handles the creation of new real estate properties with full support for multipart/form-data uploads, image processing, and database storage.

## Endpoint

```
POST /api/properties
```

## Environment Variables

Add the following to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client. It's only used server-side.

## Request Format

The API accepts `multipart/form-data` requests with the following fields:

### Required Fields

- `status` (string): Property status - `'for-sale'` or `'for-rent'`
- `type` (string): Property type - see PropertyType enum
- `area_sqm` (number): Area in square meters (must be > 0)
- `price` (number): Price (must be >= 0)
- `city` (string): City name
- `neighborhood` (string): Neighborhood name
- `title` (string): Property title
- `description` (string): Property description
- `broker_name` (string): Broker's name
- `broker_phone` (string): Broker's phone number
- `images` (File[]): At least 1 image file (max 8MB each, must be image/*)

### Optional Fields

- `subtype` (string): Property subtype
- `price_per_sqm` (number): Price per square meter (auto-calculated if not provided)
- `floor` (integer): Floor number
- `total_floors` (integer): Total floors in building
- `address` (string): Street address
- `build_year` (integer): Year the property was built
- `construction_type` (string): Type of construction
- `completion_degree` (string): Completion status
- `features` (string[]): Array of feature IDs (can be sent multiple times with same key)
- `broker_position` (string): Broker's position/title

## Image Upload Specifications

- **Max file size**: 8MB per image
- **File types**: Must start with `image/`
- **Concurrency**: Maximum 5 concurrent uploads
- **Storage**: Images are uploaded to Cloudinary in the `properties` folder

## Response Codes

- `201 Created`: Property successfully created
- `400 Bad Request`: Validation error or missing required fields
- `500 Internal Server Error`: Server error or database insertion failure

## Response Format

### Success (201)

```json
{
  "id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "status": "for-sale",
  "type": "apartment",
  "area_sqm": 120,
  "price": 150000,
  "price_per_sqm": 1250,
  "city": "Бургас",
  "neighborhood": "Сарафово",
  "title": "Прекрасен апартамент",
  "description": "...",
  "image_urls": ["https://..."],
  "image_public_ids": ["properties/..."],
  ...
}
```

### Error (400)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["area_sqm"],
      "message": "Площта трябва да е положително число"
    }
  ]
}
```

### Error (500)

```json
{
  "error": "Failed to create property",
  "details": "Database error message"
}
```

## Error Handling

### Automatic Cleanup

If the database insertion fails after images have been uploaded to Cloudinary, the API automatically:

1. Deletes all uploaded images from Cloudinary
2. Returns a 500 error response
3. Logs the error for debugging

### Image Upload Failures

- If all images fail to upload: Returns 500 error
- If some images fail: Continues with successfully uploaded images
- Uses `Promise.allSettled` to handle partial failures gracefully

## Database Schema

See `supabase/migrations/001_create_properties_table.sql` for the complete schema.

Key points:
- Uses UUID for primary keys
- Has check constraints for area_sqm > 0 and price >= 0
- Stores images as arrays (image_urls and image_public_ids)
- Includes indexes for common queries (city, type, created_at, status)
- Row Level Security (RLS) is enabled

## Example Usage

### JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('status', 'for-sale');
formData.append('type', 'apartment');
formData.append('area_sqm', '120');
formData.append('price', '150000');
formData.append('city', 'Бургас');
formData.append('neighborhood', 'Сарафово');
formData.append('title', 'Прекрасен апартамент');
formData.append('description', 'Описание на имота...');
formData.append('broker_name', 'Иван Иванов');
formData.append('broker_phone', '+359888888888');

// Add images
const imageFiles = [...]; // File objects
imageFiles.forEach(file => formData.append('images', file));

// Add features (if any)
formData.append('features', 'parking');
formData.append('features', 'elevator');

const response = await fetch('/api/properties', {
  method: 'POST',
  body: formData,
});

if (response.ok) {
  const property = await response.json();
  console.log('Property created:', property);
} else {
  const error = await response.json();
  console.error('Error:', error);
}
```

## Implementation Details

### Files Created

1. **`src/lib/supabase-admin.ts`**: Admin client with service role key
2. **`src/lib/cloudinary-server.ts`**: Server-side Cloudinary upload helpers
3. **`src/lib/validations/property-create.ts`**: Zod validation schema
4. **`src/app/api/properties/route.ts`**: Main API route handler
5. **`supabase/migrations/001_create_properties_table.sql`**: Database schema

### Runtime

The API route uses Node.js runtime (not Edge) to support:
- File buffer operations
- Cloudinary SDK
- Supabase client operations

### Concurrency Control

The image upload process uses a semaphore pattern to limit concurrent uploads to 5, preventing overwhelming Cloudinary's API and ensuring better error handling.













