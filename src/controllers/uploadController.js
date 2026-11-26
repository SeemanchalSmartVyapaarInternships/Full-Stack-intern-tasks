import { storeUploadedFile } from '../services/storageService.js';

export function createUploadController({ UploadRecord, ActivityLog }, { uploadDir = './uploads' } = {}) {
  const handleUpload = (category) => async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file attached in "file" field.' });
      }

      const actor = req.body?.uploadedBy || req.headers['x-actor'] || 'intern-user';
      const stored = await storeUploadedFile(req.file, {
        folder: `ssc/${category}`,
        uploadDir,
      });

      const record = await UploadRecord.create({
        category,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        storageProvider: stored.storageProvider,
        url: stored.url,
        publicId: stored.publicId,
        uploadedBy: actor,
        projectId: req.body?.projectId || null,
      });

      await ActivityLog.create({
        eventType: 'UPLOAD',
        actor,
        action: `Uploaded ${category}`,
        resource: req.file.originalname,
        metadataJson: JSON.stringify({
          sizeBytes: req.file.size,
          mimeType: req.file.mimetype,
          storageProvider: stored.storageProvider,
        }),
        ipAddress: req.ip || '127.0.0.1',
      });

      return res.status(201).json({
        success: true,
        message: 'File uploaded and logged.',
        data: record,
      });
    } catch (err) {
      return next(err);
    }
  };

  const listUploads = async (req, res, next) => {
    try {
      const where = {};
      if (req.query.category) where.category = req.query.category;
      const records = await UploadRecord.findAll({ where, order: [['id', 'DESC']], limit: 50 });
      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  };

  return {
    uploadProfileImage: handleUpload('profile-image'),
    uploadProjectDocument: handleUpload('project-document'),
    listUploads,
  };
}
