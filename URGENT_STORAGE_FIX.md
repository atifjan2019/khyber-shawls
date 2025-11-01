# 🚨 URGENT: Fix Disappearing Uploads

## The Problem

**Uploads are disappearing after each deployment** because Docker containers are ephemeral. When Coolify redeploys your app, it:

1. Creates a new container
2. Deletes the old container (and all its files)
3. Your uploads in `/app/public/uploads/` are **permanently lost**

## Current Situation

- ✅ `1761978579905-yipjhf-12.jpg` - Uploaded to CURRENT container (works)
- ❌ `1761978975057-13.jpg` - Uploaded to OLD container (gone forever)
- ❌ `1761978907078-7ofmj-banner.jpg` - Uploaded to OLD container (gone forever)

Every time you redeploy, **all uploaded images are deleted**.

## The Solution: Persistent Storage Volume

You MUST configure a persistent storage volume in Coolify that survives container restarts.

### Step-by-Step Fix:

#### 1. **Open Coolify Dashboard**
   - Go to https://your-coolify-domain.com
   - Login with your credentials

#### 2. **Navigate to Your Application**
   - Click on "khyber-shawls" or your app name
   - Look for the **"Storages"** tab in the left sidebar

#### 3. **Add Persistent Storage**
   - Click **"+ Add Storage"** button
   - Fill in the form:

   ```
   Name: uploads
   Source Path: /var/lib/coolify/storage/khyber-shawls/uploads
   Destination Path: /app/public/uploads
   ```

   **Explanation:**
   - **Source Path**: Directory on your VPS host machine (permanent storage)
   - **Destination Path**: Where Docker container expects to find files

#### 4. **Save Configuration**
   - Click **"Save"** or **"Add Storage"**
   - Coolify will show the volume in the list

#### 5. **Redeploy Application**
   - Click **"Deploy"** or **"Redeploy"** button
   - Wait for deployment to complete
   - New container will mount the persistent volume

#### 6. **Verify It Works**
   ```bash
   # Upload a test image through admin panel
   # Note the URL: /uploads/17xxxxx-test.jpg
   
   # Visit the URL in browser
   https://khybershawls.store/uploads/17xxxxx-test.jpg
   
   # Redeploy the application again
   # Visit the same URL - IMAGE SHOULD STILL WORK
   ```

## What This Does

### Before (Current Problem):
```
Container Lifecycle:
├── Deploy → /app/public/uploads/ is empty
├── Upload image.jpg → Saved to /app/public/uploads/image.jpg
├── Redeploy → Container deleted
└── NEW Container → /app/public/uploads/ is empty again
    └── image.jpg is GONE FOREVER
```

### After (With Persistent Storage):
```
Host Machine: /var/lib/coolify/storage/khyber-shawls/uploads/
    └── image.jpg (PERMANENT)
    
Container A:
    └── /app/public/uploads/ → MOUNTED from host
        └── image.jpg (visible)

Container B (after redeploy):
    └── /app/public/uploads/ → MOUNTED from host
        └── image.jpg (STILL visible)
```

## Alternative: Coolify UI Screenshots

If you can't find the Storages section, it might be under:
- **"Volumes"** tab
- **"Persistent Storage"** menu
- **"Resources"** → **"Storages"**

Look for options like:
- "Add Volume"
- "Mount Directory"
- "Persistent Storage"

## Manual Docker Command (If Needed)

If Coolify doesn't have a UI for this, you may need to edit the Docker Compose file:

```yaml
services:
  app:
    image: your-image
    volumes:
      - /var/lib/coolify/storage/khyber-shawls/uploads:/app/public/uploads
```

## After Configuration

### Test Checklist:
- [ ] Persistent storage volume added in Coolify
- [ ] Application redeployed successfully
- [ ] Upload a new test image
- [ ] Note the image URL
- [ ] Image is accessible via URL
- [ ] Redeploy application again
- [ ] Same image URL still works ✅

### Re-upload Lost Images:
Since old uploads are gone, you'll need to:
1. Re-upload all product images
2. Re-upload category featured images
3. Re-upload hero banner images
4. Update any broken image references in the database

## Important Notes

⚠️ **Do NOT skip this step** - Without persistent storage:
- Every deployment deletes all uploads
- Product images will randomly disappear
- Category images won't load
- Hero banners will break
- Customers will see broken images

✅ **After configuring persistent storage:**
- Uploads survive deployments
- Images remain accessible permanently
- Safe to redeploy anytime
- Can upload images with confidence

## Need Help?

If you can't find the storage configuration in Coolify:
1. Check Coolify documentation: https://coolify.io/docs
2. Look for "Volumes" or "Persistent Storage" section
3. Share a screenshot of your Coolify dashboard
4. May need to access via Docker Compose file directly

## Summary

**Right now**: Every redeploy deletes all uploads
**After fix**: Uploads are permanent and survive deployments
**Action required**: Configure persistent storage volume in Coolify NOW

---

Last updated: November 1, 2025
