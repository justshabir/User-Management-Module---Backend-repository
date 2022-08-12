import { UploadController } from '../controllers/uploadController';
import { Application, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import AuthenticationMiddleWare from '../middlewares/auth';

export class UploadRoutes {
  private uploadController: UploadController = new UploadController();
  private storage: StorageEngine = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
    },
  });

  private upload = multer({ storage: this.storage });

  public route(app: Application) {
    app.post(
      '/api/upload/profile-photo',
      AuthenticationMiddleWare.verifyTokenAndAuthorization,
      this.upload.single('image'),
      (req: Request, res: Response) => {
        this.uploadController.uploadProfileImage(req, res);
      }
    );
  }
}
