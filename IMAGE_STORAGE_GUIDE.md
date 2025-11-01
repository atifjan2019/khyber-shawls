# Image Storage Guide for Khyber Shawls

## Where Images Are Stored

### 1. **Static Assets** (Logo, Icons, SVGs)
- **Location**: `/public/` directory
- **Examples**: 
  - `/public/logo.png` - Main site logo
  - `/public/logo.svg` - SVG version of logo
  - `/public/placeholder.svg` - Default placeholder image
  - `/public/avatars/` - Customer avatar images
- **Served as**: `https://khybershawls.store/logo.png`
- **Docker**: Copied from builder stage to `/app/public`

### 2. **Uploaded Media** (Admin Uploads)
- **Location**: `/public/uploads/` directory
- **Created by**: Admin media uploads through `/admin/media`
- **Examples**: Product images, hero banners, category featured images
- **Served as**: `https://khybershawls.store/uploads/1234567890-image.jpg`
- **Docker**: Directory created at build time, **REQUIRES persistent volume**

### 3. **Database Image References**
Images are stored as URLs in these database tables:

#### **Category** (`categories` table)
```sql
featuredImageUrl: String?  -- e.g., "/uploads/category-men.jpg"
featuredImageAlt: String?  -- Alt text for accessibility
```

#### **Product** (`products` table)
```sql
image: String              -- Main product image (e.g., "/uploads/product-1.jpg")
```

#### **Product Images** (`product_images` table)
```sql
url: String                -- Additional product images
alt: String?
position: Int              -- Display order
```

#### **Hero Media** (`hero_media` table)
```sql
backgroundImageId: String? -- References Media.id for hero carousel
```

#### **Media** (`media` table)
```sql
id: String
url: String                -- e.g., "/uploads/1735732000000-banner.jpg"
alt: String?
```

#### **Settings** (`settings` table)
```sql
websiteLogoUrl: String?    -- Override default logo
websiteFaviconUrl: String? -- Custom favicon
```

## Image Upload Flow

1. **Admin uploads file** via `/admin/media` or product/category forms
2. **File is saved** to `/public/uploads/{timestamp}-{filename}`
3. **URL is stored** in database (e.g., `/uploads/1735732000000-image.jpg`)
4. **Next.js serves** the file from `/public/uploads/`

## Docker Configuration

### Current Dockerfile Setup
```dockerfile
# Copy public directory from build stage
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create uploads directory with proper permissions
RUN mkdir -p /app/public/uploads
RUN chown -R nextjs:nodejs /app
RUN chmod -R 775 /app/public
```

### Problem
Without persistent storage, **uploaded images are lost on each deployment** because Docker containers are ephemeral.

## Solution: Configure Persistent Storage in Coolify

### Step-by-Step Instructions

1. **Open Coolify Dashboard**
2. **Navigate to your application** → Click "Khyber Shawls"
3. **Click "Storages" tab** in the left sidebar
4. **Click "+ Add Storage"**
5. **Configure the volume:**

   ```
   Name: uploads
   Source Path: /var/lib/coolify/storage/khyber-shawls/uploads
   Destination Path: /app/public/uploads
   ```

   - **Source Path**: Directory on your VPS host machine
   - **Destination Path**: Path inside the Docker container

6. **Save and Redeploy**

### What This Does
- Uploads are stored on the **host machine** (survives container restarts)
- Container mounts this directory at `/app/public/uploads`
- Images persist across deployments and container updates
- Multiple containers can share the same uploads (if scaling horizontally)

## Verification Steps

### After Deployment:

1. **Check Health**
   ```bash
   curl https://khybershawls.store/api/health
   # Should return: {"status":"healthy","timestamp":"...","service":"khyber-shawls"}
   ```

2. **Check Logo Loads**
   ```bash
   curl -I https://khybershawls.store/logo.png
   # Should return: HTTP/2 200
   ```

3. **Upload a Test Image**
   - Go to `https://khybershawls.store/admin/media`
   - Upload an image
   - Verify it appears in the media library
   - Copy the URL (e.g., `/uploads/1735732000000-test.jpg`)
   - Visit `https://khybershawls.store/uploads/1735732000000-test.jpg`
   - Image should display correctly

4. **Check After Redeploy**
   - Redeploy the application in Coolify
   - Visit the uploaded image URL again
   - **Should still be accessible** (if persistent storage is configured)

## Common Issues

### Issue 1: Images Return 404
**Cause**: Public directory not copied correctly in Docker
**Solution**: Ensure Dockerfile copies public directory and sets correct permissions (already fixed)

### Issue 2: Uploads Lost After Deployment
**Cause**: No persistent volume configured
**Solution**: Add persistent storage in Coolify as shown above

### Issue 3: Permission Denied on Upload
**Cause**: Container user doesn't have write permissions
**Solution**: Check ownership and permissions in Dockerfile:
```dockerfile
RUN chown -R nextjs:nodejs /app
RUN chmod -R 775 /app/public
```

### Issue 4: Image URLs in Database Are Wrong
**Cause**: Absolute URLs instead of relative paths
**Solution**: Images should be stored as `/uploads/filename.jpg` (not full URLs)

## Environment Variables

No environment variables are needed for local file storage. If you want to use external storage (S3, Cloudinary) in the future, add:

```env
# Optional: Cloud storage (not currently implemented)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
S3_BUCKET=
S3_REGION=
```

## Next Steps

1. ✅ Health check working (curl installed)
2. ✅ Public directory properly copied
3. ⏳ **Configure persistent storage in Coolify** (do this now)
4. ⏳ Test image uploads after deployment
5. ⏳ Add category images in admin panel
6. ⏳ Set product images for all products

## File Paths Reference

```
Production (Docker):
/app/public/logo.png          → https://khybershawls.store/logo.png
/app/public/uploads/image.jpg → https://khybershawls.store/uploads/image.jpg

Development (Local):
/Users/atifjan/Desktop/Khybershawls/public/logo.png
/Users/atifjan/Desktop/Khybershawls/public/uploads/image.jpg
```

## Database Queries for Image Management

### Find all products without images:
```sql
SELECT id, name FROM products WHERE image IS NULL OR image = '';
```

### Find all categories without featured images:
```sql
SELECT id, name FROM categories WHERE featuredImageUrl IS NULL;
```

### List all uploaded media:
```sql
SELECT id, url, alt, createdAt FROM media ORDER BY createdAt DESC;
```

### Check unused media (not referenced anywhere):
```sql
SELECT m.id, m.url FROM media m
WHERE m.id NOT IN (SELECT backgroundImageId FROM hero_media WHERE backgroundImageId IS NOT NULL);
```
