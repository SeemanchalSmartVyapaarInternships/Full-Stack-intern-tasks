import multer from 'multer';

const PROFILE_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOCUMENT_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function createUploadValidator({ allowedMimes, maxBytes, fieldName }) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimes.has(file.mimetype)) {
        const err = new Error(
          `Unsupported file type (${file.mimetype}). Allowed: ${Array.from(allowedMimes).join(', ')}`
        );
        err.status = 400;
        return cb(err);
      }
      return cb(null, true);
    },
  });

  return upload.single(fieldName);
}

export const uploadProfileImageMiddleware = createUploadValidator({
  allowedMimes: PROFILE_IMAGE_MIMES,
  maxBytes: 2 * 1024 * 1024, // 2 MB
  fieldName: 'file',
});

export const uploadProjectDocumentMiddleware = createUploadValidator({
  allowedMimes: DOCUMENT_MIMES,
  maxBytes: 5 * 1024 * 1024, // 5 MB
  fieldName: 'file',
});
