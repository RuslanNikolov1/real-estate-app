# Quick Guide: Adding Supabase Callback URL to Google Cloud Console

## Why This Is Needed

When users click "Sign in with Google", the OAuth flow works like this:
1. User clicks → Redirects to Google
2. User authorizes → Google redirects to **Supabase** (not your app directly)
3. Supabase processes the OAuth → Redirects to your app's `/auth/callback`

Google needs to know that Supabase is an authorized redirect destination, which is why you must add the Supabase callback URL to Google Cloud Console.

## Quick Steps

### 1. Find Your Supabase Project Reference ID

**Option A: From Supabase Dashboard**
- Go to https://supabase.com/dashboard
- Select your project
- Go to **Settings** → **General**
- Look at **Reference ID** or check your API URL
- It looks like: `abcdefghijklm` (random characters)

**Option B: From Your Environment Variables**
- Check `NEXT_PUBLIC_SUPABASE_URL`
- If it's `https://abcdefghijklm.supabase.co`
- Then `abcdefghijklm` is your project reference ID

### 2. Open Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Make sure you're in the correct project (the one with your OAuth credentials)
3. Navigate to: **APIs & Services** → **Credentials**

### 3. Edit Your OAuth Client

1. Find your OAuth 2.0 Client ID in the list
   - Your Client ID: `877617381621-m7130osnsclvfl1dclput8tnn3p46i6h.apps.googleusercontent.com`
2. Click on it to edit

### 4. Add the Supabase Callback URL

1. Scroll to **Authorized redirect URIs** section
2. Click **+ ADD URI**
3. Enter this URL (replace `YOUR_PROJECT_REF` with your actual project reference ID):
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
4. Click **SAVE**

### 5. Example

If your Supabase project reference ID is `abcdefghijklm`, you would add:
```
https://abcdefghijklm.supabase.co/auth/v1/callback
```

## Common Mistakes to Avoid

❌ **Wrong**: `http://` (must be `https://`)
❌ **Wrong**: Missing `/auth/v1/callback` at the end
❌ **Wrong**: Using your Next.js app URL instead of Supabase URL
❌ **Wrong**: Typos in the project reference ID

✅ **Correct**: `https://abcdefghijklm.supabase.co/auth/v1/callback`

## Testing

After adding the URL:
1. Save the changes in Google Cloud Console
2. Wait a few seconds for changes to propagate
3. Try logging in with Google on your app
4. Check browser console for any errors

## Troubleshooting

**Error: "Redirect URI mismatch"**
- Double-check the URL is exactly: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Make sure there are no trailing spaces
- Verify the project reference ID is correct

**Error: "localhost refused to connect"**
- This is a different issue - see `DEPLOYMENT_OAUTH_SETUP.md` for Supabase dashboard configuration

**Still not working?**
- Verify you're editing the correct OAuth Client ID
- Check that the Supabase project reference ID matches your actual project
- Ensure you saved the changes in Google Cloud Console
