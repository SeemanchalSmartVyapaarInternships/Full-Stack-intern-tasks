import { Router } from 'express';
import {
  uploadProfileImageMiddleware,
  uploadProjectDocumentMiddleware,
} from '../middleware/uploadMiddleware.js';
import { createUploadController } from '../controllers/uploadController.js';

export function createUploadRouter(models, options) {
  const router = Router();
  const ctrl = createUploadController(models, options);

  router.get('/', ctrl.listUploads);
  router.post('/profile-image', uploadProfileImageMiddleware, ctrl.uploadProfileImage);
  router.post('/project-document', uploadProjectDocumentMiddleware, ctrl.uploadProjectDocument);

  return router;
}
