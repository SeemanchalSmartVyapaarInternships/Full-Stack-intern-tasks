# Week 4: File Upload & Activity Tracking Module

Branch: `feature/file-management-system`

## Storage Behavior
- Uses **Cloudinary** automatically when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set.
- Falls back cleanly to local disk (`./uploads/`, labeled `storageProvider: "local-fallback"`) when Cloudinary credentials are absent.

## Endpoints
- `POST /api/uploads/profile-image` — `multipart/form-data` (`file` field; JPEG/PNG/WEBP, max 2 MB)
- `POST /api/uploads/project-document` — `multipart/form-data` (`file` field; PDF/JPEG/PNG/TXT/DOCX, max 5 MB)
- `GET /api/uploads` — List upload history (`?category=`)
- `GET /api/activity` — Query user action logs (`?eventType=&actor=`)
- `POST /api/activity/login-event` — Record login history
- `POST /api/activity/task-update` — Record task status transitions
