# Image URL Security Fix

## Issue
Category pages were throwing Next.js image errors when external URLs (like `bad-tomatillo.name`) were entered in the admin panel.

```
Invalid src prop (https://bad-tomatillo.name/) on `next/image`, 
hostname "bad-tomatillo.name" is not configured under images in your `next.config.js`
```

## Root Cause
The dynamic category system allows admins to enter any URL for intro and section images, but Next.js requires external hostnames to be explicitly allowed in `next.config.ts` for security and optimization.

## Solution Implemented

### 1. **Client-Side Validation** ✅
Updated `/app/category/[slug]/view.tsx` to only render images with local paths:

```tsx
// Only render if URL starts with /
{category.intro.image?.url && category.intro.image.url.startsWith('/') && (
  <Image src={category.intro.image.url} ... />
)}
```

This prevents Next.js from even attempting to load external URLs.

### 2. **Server-Side Validation** ✅
Updated `/app/admin/categories/actions.ts` to sanitize URLs before saving:

```typescript
// Validate image URL is local
const validIntroImageUrl = (introImageUrl && introImageUrl.startsWith('/')) 
  ? introImageUrl 
  : ''
```

Empty string is saved if URL doesn't start with `/`, preventing bad data from reaching the database.

### 3. **Admin UI Guidance** ✅
Updated `/components/admin/category-edit-form.tsx` to show clear instructions:

```tsx
<p className="text-xs text-gray-500">
  Must start with / (local images only). Upload to /public/uploads/ first.
</p>
```

Helps admins understand the requirement upfront.

## How It Works Now

### Valid Image URLs ✅
- `/uploads/category-intro.jpg` ✓
- `/uploads/mens-shawls.png` ✓
- `/images/hero.jpg` ✓
- Any path starting with `/` ✓

### Invalid Image URLs ❌
- `https://example.com/image.jpg` ✗ (external)
- `http://bad-tomatillo.name/pic.png` ✗ (external)
- `example.com/image.jpg` ✗ (no protocol/path)

## Why Local Images Only?

### Security
- ✅ No risk of loading malicious external content
- ✅ No SSRF (Server-Side Request Forgery) vulnerabilities
- ✅ Full control over image sources

### Performance
- ✅ Next.js Image optimization works best with local images
- ✅ No external CDN dependencies
- ✅ Faster page loads (no external requests)
- ✅ Consistent image quality and sizing

### Simplicity
- ✅ Single source of truth (`/public/uploads/`)
- ✅ Easy backup and migration
- ✅ No external API keys or CDN configuration
- ✅ Works offline during development

## Admin Workflow

### Correct Process:
1. Upload image to `/public/uploads/` via file system or FTP
2. In admin panel, enter `/uploads/your-image.jpg`
3. Save category
4. Image displays correctly on category page ✓

### What Happens with External URLs:
1. Admin enters `https://example.com/image.jpg`
2. Server sanitizes to empty string `""`
3. Category saves without image
4. No error on frontend (gracefully hidden)
5. Admin sees no image, realizes mistake

## File Changes Summary

### 1. `/app/category/[slug]/view.tsx`
- Added `.startsWith('/')` check before rendering `<Image>`
- Applied to both intro image and section images
- Gracefully hides images with invalid URLs

### 2. `/app/admin/categories/actions.ts`
- Added validation in `updateCategoryAction`
- Filters intro image URL
- Filters all section image URLs
- Only saves URLs starting with `/`

### 3. `/components/admin/category-edit-form.tsx`
- Added helper text under image URL inputs
- Clear instructions: "Must start with / (local images only)"
- Guidance: "Upload to /public/uploads/ first"

## Testing

### Test Case 1: Valid Local Image ✅
```
Input: /uploads/test.jpg
Result: Image displays correctly
```

### Test Case 2: External URL ❌
```
Input: https://bad-tomatillo.name/pic.jpg
Server: Sanitizes to ""
Frontend: Gracefully hides image section
Result: No error, no image (as expected)
```

### Test Case 3: Empty/Missing URL ✅
```
Input: (empty)
Server: Saves as ""
Frontend: Hides section gracefully
Result: Section with text only
```

## Benefits

- 🛡️ **Secure**: No external content injection
- ⚡ **Fast**: Optimized local images only
- 🎯 **Simple**: One folder for all images
- ✅ **Graceful**: Invalid URLs don't crash the page
- 📝 **Clear**: Admin instructions prevent mistakes
- 🔒 **Validated**: Both client and server-side checks

## Migration Notes

If you have existing categories with external URLs:

1. They won't display (gracefully hidden)
2. Re-upload images to `/public/uploads/`
3. Update category with new local paths
4. Images will display correctly

## Alternative: Allow External URLs

If you need to allow external images from specific domains:

1. Add domain to `/next.config.ts`:
```typescript
const ALLOWED_HOSTNAMES = [
  "images.unsplash.com",
  "your-cdn.com", // Add here
]
```

2. Remove the `.startsWith('/')` checks in view component
3. Remove server validation in actions

**Not recommended** unless you have a specific CDN requirement.

## Conclusion

✅ **Issue Resolved**  
Categories now safely handle image URLs with proper validation and graceful fallbacks. Admin UI guides users to use local images, preventing configuration errors.

---

**Fix Applied**: October 31, 2025  
**Files Modified**: 3  
**Security Level**: High ✅
