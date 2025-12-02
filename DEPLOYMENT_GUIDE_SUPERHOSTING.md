# Deployment Guide for superhosting.bg

## 📋 Overview

This guide will help you deploy your Next.js real estate application to superhosting.bg. The deployment process depends on your hosting plan type.

## 🔍 Prerequisites

Before starting, ensure you have:
- ✅ A superhosting.bg account with Node.js hosting or VPS
- ✅ Access to your hosting control panel (cPanel, Plesk, or SSH)
- ✅ All environment variables ready
- ✅ Domain name configured (if applicable)

## 🎯 Step 1: Determine Your Hosting Type

### Option A: Node.js Hosting Plan
If superhosting.bg offers Node.js hosting, this is the easiest option.

### Option B: VPS/Shared Hosting with Node.js Support
You'll need SSH access and Node.js installed.

### Option C: Static Export (Limited)
Only if your app doesn't use server-side features (API routes, server components with dynamic data).

## 🚀 Step 2: Prepare Your Application

### 2.1 Build the Application Locally (Test First)

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test locally
npm start
```

If the build succeeds, you're ready to deploy.

### 2.2 Create Production Environment File

Create a `.env.production` file (or configure in hosting panel):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Cloudinary (Required)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Node Environment
NODE_ENV=production
```

**⚠️ Important**: Never commit `.env.production` to Git. Add it to `.gitignore`.

## 📦 Step 3: Deployment Methods

### Method A: Node.js Hosting (Recommended)

#### 3.1 Upload Files via FTP/SFTP

1. **Connect to your hosting via FTP/SFTP**
   - Host: `ftp.yourdomain.com` or IP provided by superhosting.bg
   - Username: Your hosting username
   - Password: Your hosting password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload project files** (excluding `node_modules` and `.next`)
   - Upload entire project to your hosting directory (usually `public_html` or `www`)
   - Or create a subdirectory like `app` if you prefer

3. **Files to upload**:
   ```
   ✅ src/
   ✅ public/
   ✅ supabase/
   ✅ package.json
   ✅ package-lock.json
   ✅ next.config.js
   ✅ tsconfig.json
   ✅ .env.production (or configure in hosting panel)
   ❌ node_modules/ (will be installed on server)
   ❌ .next/ (will be built on server)
   ```

#### 3.2 Install Dependencies on Server

**Via SSH:**
```bash
# Navigate to your project directory
cd /path/to/your/project

# Install dependencies
npm install --production
```

**Via Hosting Panel:**
- Look for "Node.js" or "Terminal" section
- Run the install command there

#### 3.3 Build the Application

```bash
# Build Next.js application
npm run build
```

#### 3.4 Configure Node.js App in Hosting Panel

1. **Set Application Root**: Point to your project directory
2. **Set Start Command**: `npm start`
3. **Set Port**: Usually auto-detected, or use `3000`
4. **Set Environment Variables**: Add all variables from `.env.production`

#### 3.5 Configure Process Manager (PM2) - Recommended

If you have SSH access, install PM2 for process management:

```bash
# Install PM2 globally
npm install -g pm2

# Start your app with PM2
pm2 start npm --name "real-estate-app" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on server reboot
pm2 startup
```

### Method B: VPS with Nginx Reverse Proxy

If you have a VPS, you can set up Nginx as a reverse proxy:

#### 3.1 Install Node.js and Nginx

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

#### 3.2 Deploy Application

```bash
# Clone or upload your project
cd /var/www
git clone your-repo-url real-estate-app
# OR upload via SFTP to /var/www/real-estate-app

# Navigate to project
cd real-estate-app

# Install dependencies
npm install --production

# Build application
npm run build

# Create .env.production
nano .env.production
# Paste your environment variables and save (Ctrl+X, Y, Enter)

# Start with PM2
pm2 start npm --name "real-estate-app" -- start
pm2 save
pm2 startup
```

#### 3.3 Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/real-estate-app
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/real-estate-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.4 Setup SSL with Let's Encrypt (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Method C: Static Export (Limited - Not Recommended)

⚠️ **Warning**: This only works if you don't use:
- API routes (`/api/*`)
- Server-side rendering with dynamic data
- Server Components with database queries

If you want to try static export:

1. **Update `next.config.js`**:
```javascript
const nextConfig = {
  output: 'export',
  // ... rest of config
};
```

2. **Build static files**:
```bash
npm run build
```

3. **Upload `out/` directory** to your hosting via FTP

## 🔧 Step 4: Configure Environment Variables

### Via Hosting Panel:
1. Log into superhosting.bg control panel
2. Find "Environment Variables" or "App Settings"
3. Add each variable from `.env.production`

### Via SSH:
```bash
# Edit .env.production
nano .env.production
# Add all variables, save and exit
```

## 🌐 Step 5: Configure Domain & DNS

1. **Point Domain to Your Hosting**:
   - In your domain registrar, set A record to your hosting IP
   - Or use CNAME if provided by superhosting.bg

2. **Configure Domain in Hosting Panel**:
   - Add your domain in the hosting control panel
   - Point it to your application directory

## ✅ Step 6: Verify Deployment

1. **Check Application Status**:
   ```bash
   # If using PM2
   pm2 status
   pm2 logs real-estate-app
   ```

2. **Test Your Application**:
   - Visit `http://yourdomain.com`
   - Test property creation
   - Test image uploads
   - Check API routes

3. **Common Issues**:
   - **Port conflicts**: Ensure port 3000 is available
   - **Environment variables**: Verify all are set correctly
   - **Build errors**: Check Node.js version (should be 18+)
   - **Database connection**: Verify Supabase URL and keys

## 🔒 Step 7: Security Checklist

- [ ] All environment variables are set (especially secrets)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT exposed to client
- [ ] `CLOUDINARY_API_SECRET` is NOT exposed to client
- [ ] SSL certificate is installed (HTTPS)
- [ ] Firewall is configured (if VPS)
- [ ] Regular backups are set up

## 📊 Step 8: Monitoring & Maintenance

### Setup Logging

```bash
# View PM2 logs
pm2 logs real-estate-app

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Setup Auto-restart

PM2 automatically restarts on crash, but verify:
```bash
pm2 startup
pm2 save
```

### Regular Updates

```bash
# Update dependencies
npm update

# Rebuild application
npm run build

# Restart application
pm2 restart real-estate-app
```

## 🆘 Troubleshooting

### Application Won't Start

1. Check Node.js version: `node -v` (should be 18+)
2. Check logs: `pm2 logs` or hosting panel logs
3. Verify environment variables are set
4. Check port availability

### Build Errors

1. Ensure all dependencies are installed: `npm install`
2. Check Node.js version compatibility
3. Review build logs for specific errors

### Database Connection Issues

1. Verify Supabase URL and keys
2. Check Supabase project is active
3. Verify network connectivity from server

### Image Upload Issues

1. Verify Cloudinary credentials
2. Check file size limits
3. Verify Cloudinary API permissions

## 📞 Support

If you encounter issues:
1. Check superhosting.bg documentation
2. Contact superhosting.bg support
3. Review Next.js deployment documentation
4. Check application logs

## 📝 Notes

- **Node.js Version**: Ensure you're using Node.js 18 or higher
- **Memory**: Next.js apps typically need at least 512MB RAM
- **Storage**: Ensure enough space for `node_modules` and build files
- **Backups**: Regularly backup your database (Supabase) and files

---

**Good luck with your deployment! 🚀**

