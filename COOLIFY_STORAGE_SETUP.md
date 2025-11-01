# Persistent Storage Setup for Coolify

## Problem
Uploaded images in `/public/uploads` are lost on every deployment because Docker containers are ephemeral.

## Solution: Configure Persistent Volume in Coolify

### Step 1: Add Volume in Coolify

1. Go to your application in Coolify
2. Click on **Storages** tab (or **Volumes**)
3. Click **+ Add Volume**
4. Configure:
   - **Name**: `uploads`
   - **Source**: `/var/lib/docker/volumes/khyber-uploads/_data` (or let Coolify auto-generate)
   - **Destination**: `/app/public/uploads`
   - **Mode**: Read/Write

### Step 2: Set Permissions (Important!)

After adding the volume, you need to ensure the Next.js app can write to it.

In Coolify, go to **Terminal** and run:

\`\`\`bash
# Find your container
docker ps | grep khyber

# Set permissions (replace CONTAINER_ID with your actual container ID)
docker exec -it CONTAINER_ID chmod -R 777 /app/public/uploads
docker exec -it CONTAINER_ID chown -R node:node /app/public/uploads
\`\`\`

Or add this to your Dockerfile if you create one:

\`\`\`dockerfile
# Ensure uploads directory exists and has correct permissions
RUN mkdir -p /app/public/uploads && chown -R node:node /app/public/uploads
\`\`\`

### Step 3: Redeploy

After setting up the volume:
1. Click **Redeploy** in Coolify
2. Wait for deployment to complete
3. Test image upload in admin panel

### Accessing Images

Images will be accessible at:
- \`http://khybershawls.store/uploads/filename.jpg\`
- Or via API route: \`http://khybershawls.store/api/uploads/filename.jpg\`

## Alternative: Use Cloud Storage (Recommended for Production)

For better performance and reliability, consider using:

### Cloudinary (Free tier available)
1. Sign up at https://cloudinary.com
2. Get your credentials
3. Add environment variables in Coolify:
   \`\`\`
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   \`\`\`

### AWS S3 or DigitalOcean Spaces
Better for production with CDN support.

## Troubleshooting

### Images showing 404
- Check if volume is mounted: `docker exec CONTAINER_ID ls -la /app/public/uploads`
- Verify file exists: `docker exec CONTAINER_ID ls /app/public/uploads`
- Check file permissions

### Permission denied errors
Run: `docker exec -it CONTAINER_ID chmod -R 777 /app/public/uploads`

### Images lost after deployment
The volume configuration wasn't saved properly. Re-add the volume and redeploy.
