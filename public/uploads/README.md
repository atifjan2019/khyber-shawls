# Uploads Directory

This directory stores uploaded images from the admin panel.

**Note**: In production (Coolify/Docker), you need to configure a persistent volume for this directory. See `COOLIFY_STORAGE_SETUP.md` for instructions.

## Structure
```
public/uploads/
├── 1234567890-image-name.jpg
├── 1234567891-another-image.png
└── ...
```

Files are automatically named with a timestamp prefix to avoid conflicts.
