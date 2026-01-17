# OAuth Deployment Setup Guide

## Problem: "localhost refused to connect" in Production

When deploying your application, Google OAuth may try to redirect to `localhost` instead of your production domain. This happens because Supabase needs to be configured with your production URLs.

## Solution: Configure Supabase Dashboard

The local `supabase/config.toml` file is only for local development. For production, you must configure redirect URLs in the **Supabase Dashboard**.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Configure Authentication Settings**
   - Go to **Authentication** → **URL Configuration**
   - Or navigate to **Settings** → **Auth** → **URL Configuration**

3. **Update Site URL**
   - Set **Site URL** to your production domain:
     ```
     https://your-production-domain.com
     ```
     Example: `https://brokerbulgaria.bg`

4. **Add Redirect URLs**
   - In the **Redirect URLs** section, add your production callback URL:
     ```
     https://your-production-domain.com/auth/callback
     ```
   - You can add multiple URLs if needed (e.g., for staging environments):
     ```
     https://your-production-domain.com/auth/callback
     https://staging.your-domain.com/auth/callback
     ```

5. **Configure Google OAuth Provider**
   - Go to **Authentication** → **Providers** → **Google**
   - Ensure the provider is enabled
   - Verify your Google OAuth credentials are correct:
     - Client ID
     - Client Secret (stored as environment variable)

6. **Update Google Cloud Console with Supabase Callback URL**

   This step is **required** for Google OAuth to work with Supabase. Google needs to know that Supabase is an authorized redirect destination.

   **Step-by-Step Instructions:**

   a. **Get Your Supabase Project Reference ID**
      - Go to your Supabase Dashboard: https://supabase.com/dashboard
      - Select your project
      - Go to **Settings** → **General** (or check your project URL)
      - Your Supabase URL looks like: `https://xxxxxxxxxxxxx.supabase.co`
      - The part before `.supabase.co` is your project reference ID
      - Example: If your URL is `https://abcdefghijklm.supabase.co`, then `abcdefghijklm` is your project reference ID

   b. **Open Google Cloud Console**
      - Go to [Google Cloud Console](https://console.cloud.google.com/)
      - Make sure you're in the correct Google Cloud project (the one that contains your OAuth credentials)

   c. **Navigate to OAuth Credentials**
      - In the left sidebar, click **APIs & Services**
      - Click **Credentials** (or go directly to: https://console.cloud.google.com/apis/credentials)
      - You'll see a list of OAuth 2.0 Client IDs

   d. **Find Your OAuth Client ID**
      - Look for the Client ID that matches the one in your Supabase config
      - From your `supabase/config.toml`, the Client ID is: `877617381621-m7130osnsclvfl1dclput8tnn3p46i6h.apps.googleusercontent.com`
      - Click on this OAuth 2.0 Client ID to edit it

   e. **Add Supabase Callback URL**
      - Scroll down to the **Authorized redirect URIs** section
      - Click **+ ADD URI** button
      - Enter the Supabase callback URL in this exact format:
        ```
        https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
        ```
      - Replace `YOUR_PROJECT_REF` with your actual Supabase project reference ID from step 6a
      - Example: `https://abcdefghijklm.supabase.co/auth/v1/callback`
      - **Important**: The URL must be exactly:
        - `https://` (not `http://`)
        - Your project reference ID
        - `.supabase.co/auth/v1/callback` (exact path)

   f. **Save Changes**
      - Click **SAVE** at the bottom of the page
      - Changes take effect immediately (no need to wait)

   **Visual Guide:**
   ```
   Google Cloud Console
   └── APIs & Services
       └── Credentials
           └── OAuth 2.0 Client IDs
               └── [Your Client ID]
                   └── Authorized redirect URIs
                       └── + ADD URI
                           └── https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   **Important Notes:**
   - You can add multiple redirect URIs (one per line)
   - If you have both development and production Supabase projects, add both:
     - `https://dev-project.supabase.co/auth/v1/callback`
     - `https://prod-project.supabase.co/auth/v1/callback`
   - The URL is case-sensitive, so make sure it matches exactly
   - You don't need to add your Next.js app URL here - only the Supabase callback URL

## Environment Variables

Make sure these environment variables are set in your deployment platform (Vercel, etc.):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-google-oauth-secret
```

## Testing

After configuration:

1. Clear your browser cache and cookies
2. Try logging in with Google on your production site
3. Check the browser console for any errors
4. Verify the redirect URL in the network tab (should be your production domain, not localhost)

## Common Issues

### Issue: Still redirecting to localhost (e.g., `http://localhost:3000/?code=...`)

**This is the #1 most common issue!** It means Supabase dashboard is not configured correctly.

**CRITICAL FIX - Do these steps in order:**

1. **Go to Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**

2. **Change Site URL** from `http://localhost:3000` to your production domain:
   ```
   https://your-production-domain.com
   ```
   **Example:** If your site is `https://brokerbulgaria.bg`, set Site URL to exactly that.

3. **Add Redirect URLs** - This is the most important step:
   - Click "Add URL" or the "+" button
   - Add your production callback URL:
     ```
     https://your-production-domain.com/auth/callback
     ```
   - **Remove** any localhost URLs if they exist in the list
   - **Save** the changes

4. **Verify the settings:**
   - Site URL should be your production domain (NOT localhost)
   - Redirect URLs should include your production callback URL (NOT localhost)
   - Both should use `https://` (not `http://`)

5. **Clear browser cache and cookies**, then try again

**Why this happens:**
- Supabase uses the "Site URL" as the default redirect destination
- If Site URL is set to `localhost:3000`, Supabase will redirect there even if your code passes a different URL
- The `redirectTo` parameter in your code is ignored if the production domain isn't in the allowed Redirect URLs list

### Issue: "Redirect URI mismatch" error
- **Solution**: Ensure the redirect URL in Supabase matches exactly what's configured in Google Cloud Console

### Issue: OAuth works locally but not in production
- **Solution**: This is almost always a Supabase dashboard configuration issue. Double-check the Site URL and Redirect URLs settings.

## Notes

- The `supabase/config.toml` file is **only for local development**
- Production settings must be configured in the **Supabase Dashboard**
- Changes to Supabase dashboard settings take effect immediately (no deployment needed)
- The code automatically uses `window.location.origin` to construct redirect URLs, so it works in both dev and production
