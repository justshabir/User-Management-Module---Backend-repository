import { UploadController } from '../controllers/uploadController';
import { Application, Request, Response } from 'express';
import multer, { StorageEngine } from 'multer';
import AuthenticationMiddleWare from '../middlewares/auth';
import CommonService from '../modules/common/service';

export class UploadRoutes {
  private maxFileSize: number = 1 * 1024 * 1024; // Max file size is 5MB
  private uploadController: UploadController = new UploadController();
  private storage: StorageEngine = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      cb(null, file.originalname + '-' + Date.now());
    },
  });

  public upload = multer({ storage: this.storage, limits: { fileSize: this.maxFileSize } }).single(
    'image'
  );

  public route(app: Application) {
    app.post(
      '/api/upload/profile-photo',
      AuthenticationMiddleWare.verifyToken,
       (req, res, next)  => {
       this.upload(req, res,  (err) =>  {
          if (err) {
            return CommonService.failureResponse('Error uploading file.', err, res);
          }
          next();
        });
      },

      (req: Request, res: Response) => {
        this.uploadController.uploadProfileImage(req, res);
      }
    );
  }
}
