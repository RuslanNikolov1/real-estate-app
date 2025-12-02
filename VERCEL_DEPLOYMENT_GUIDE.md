# Vercel Deployment Guide (with Domain from superhosting.bg)

## 🎯 Overview

This guide shows you how to:
1. **Deploy your Next.js app to Vercel** (hosting)
2. **Use superhosting.bg only for domain registration** (not hosting)
3. **Point your domain to Vercel**

This is the **recommended setup** - Vercel is optimized for Next.js and much easier to manage!

---

## ✅ Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
   - You can use your GitHub account for easy integration

2. **Import your GitHub repository**
   - Click "Add New Project"
   - Select your repository: `RuslanNikolov1/real-estate-app`
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:
   
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   
   **Important**: 
   - Add these for **Production**, **Preview**, and **Development** environments
   - `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDINARY_API_SECRET` are **secret** - never expose to client

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-3 minutes)
   - Your app will be live at: `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From your project directory
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm settings
   - Add environment variables when prompted

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   vercel env add NEXT_PUBLIC_CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🌐 Step 2: Configure Domain from superhosting.bg

### 2.1 Get Your Vercel Domain Information

After deploying to Vercel:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Domains**
3. You'll see your Vercel domain: `your-project.vercel.app`
4. Note the **DNS records** Vercel provides (you'll need these)

### 2.2 Add Custom Domain in Vercel

1. In Vercel dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
4. Vercel will show you the DNS records you need to configure

**Example DNS records Vercel might show:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔧 Step 3: Point Domain from superhosting.bg to Vercel

### 3.1 Access superhosting.bg Domain Management

1. **Log into superhosting.bg control panel**
2. **Find "Domain Management" or "DNS Management"**
   - This might be in:
     - Domain settings
     - DNS Zone Editor
     - Nameservers section

### 3.2 Configure DNS Records

You have two options:

#### Option A: Use Vercel's Nameservers (Recommended)

1. **In Vercel**: Go to **Settings** → **Domains** → Your domain
2. **Copy the nameservers** Vercel provides (usually 2-4 nameservers)
   - Example: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

3. **In superhosting.bg**:
   - Go to Domain Management
   - Find "Nameservers" or "DNS Servers"
   - Change from default to Vercel's nameservers
   - Save changes

4. **Wait for propagation** (usually 24-48 hours, but often faster)

#### Option B: Use DNS Records (If you can't change nameservers)

1. **In Vercel**: Get the DNS records (A record or CNAME)

2. **In superhosting.bg DNS Zone Editor**:
   
   **For root domain (`yourdomain.com`):**
   ```
   Type: A
   Name: @ (or leave blank)
   Value: 76.76.21.21 (Vercel's IP - check Vercel dashboard for current IP)
   TTL: 3600 (or default)
   ```
   
   **For www subdomain (`www.yourdomain.com`):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com (or value from Vercel)
   TTL: 3600 (or default)
   ```

3. **Save DNS records**

4. **Wait for DNS propagation** (usually 1-24 hours)

### 3.3 Verify DNS Configuration

After updating DNS:

1. **Check DNS propagation**:
   - Use [whatsmydns.net](https://www.whatsmydns.net)
   - Enter your domain
   - Check if A/CNAME records point to Vercel

2. **In Vercel dashboard**:
   - Go to **Settings** → **Domains**
   - Wait for domain status to show "Valid Configuration"
   - Vercel will automatically provision SSL certificate

---

## ✅ Step 4: Verify Everything Works

1. **Visit your domain**: `https://yourdomain.com`
2. **Test your app**:
   - Property listing page
   - Property creation (admin)
   - Image uploads
   - API routes

3. **Check SSL**: 
   - Vercel automatically provides SSL certificates
   - Your site should be accessible via HTTPS

---

## 🔄 Step 5: Automatic Deployments (Optional but Recommended)

### Connect GitHub for Auto-Deploy

1. **In Vercel**: Project Settings → **Git**
2. **Connect GitHub repository** (if not already connected)
3. **Configure**:
   - **Production Branch**: `main` (or your main branch)
   - **Auto-deploy**: Enabled

Now, every time you push to `main`, Vercel will automatically:
- Build your app
- Run tests
- Deploy to production

---

## 📊 Step 6: Monitoring & Analytics

### Vercel Analytics (Optional)

1. **Enable Analytics**:
   - Project Settings → **Analytics**
   - Enable Web Analytics (free tier available)

2. **View metrics**:
   - Page views
   - Performance metrics
   - Real-time visitors

---

## 🆘 Troubleshooting

### Domain Not Working

1. **Check DNS propagation**: Use [whatsmydns.net](https://www.whatsmydns.net)
2. **Verify DNS records** match Vercel's requirements
3. **Wait longer**: DNS can take up to 48 hours
4. **Check Vercel dashboard**: Domain should show "Valid Configuration"

### Build Errors

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Test locally**: `npm run build` should work

### SSL Certificate Issues

1. **Wait**: Vercel automatically provisions SSL (can take a few minutes)
2. **Check domain status** in Vercel dashboard
3. **Verify DNS** is correctly configured

### API Routes Not Working

1. **Check environment variables** in Vercel
2. **Verify `vercel.json`** configuration
3. **Check function logs** in Vercel dashboard

---

## 💡 Benefits of This Setup

✅ **Vercel Hosting**:
- Optimized for Next.js
- Automatic SSL certificates
- Global CDN
- Easy deployments
- Free tier available
- Automatic scaling

✅ **superhosting.bg Domain**:
- Keep your domain registration
- Just manage DNS
- No hosting costs (if only using for domain)

---

## 📝 Summary

1. ✅ Deploy to Vercel (via dashboard or CLI)
2. ✅ Add environment variables in Vercel
3. ✅ Add custom domain in Vercel
4. ✅ Point DNS from superhosting.bg to Vercel
5. ✅ Wait for DNS propagation
6. ✅ Your site is live! 🎉

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Domain Setup Guide](https://vercel.com/docs/concepts/projects/domains)
- [DNS Propagation Checker](https://www.whatsmydns.net)

---

**Need help?** Check Vercel's documentation or contact their support - they're very helpful!

