import { Application, NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { S3Aws } from '../utils/aws';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';
import CommonService from '../modules/common/service';
import ValidatorMiddleware from '../middlewares/validator';
import technicalSupportSchema from '../modules/support/validator';
import { SupportController } from '../controllers/supportController';

export class SupportRoutes {
  private supportController: SupportController = new SupportController();
  private maxFileSize: number = 5 * 1024 * 1024; // Max file size is 5MB
  private S3: aws.S3 = new S3Aws();

  public upload = multer({
    limits: { fileSize: this.maxFileSize },
    fileFilter(req, file, callback: FileFilterCallback) {
      if (!file.originalname.match(/\.(png|jpg|jpeg|pdf)$/)) {
        return callback(null, false);
      }
      callback(null, true);
    },
    storage: multerS3({
      s3: this.S3,
      bucket: process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET,
      metadata: function (req: Request, file: any, cb: any) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req: Request, file: any, cb: any) {
        cb(null, Date.now().toString());
      },
    }),
  }).single('file');

  public route(app: Application) {
    app.post(
      '/api/technical-support',
      (req: Request, res: Response, next: NextFunction) => {
        this.upload(req, res, (err: any) => {
          if (err) {
            return CommonService.failureResponse('Error uploading file.', err, res);
          }
          next();
        });
      },
      ValidatorMiddleware(technicalSupportSchema.requestSupport, 'body'),
      (req: Request, res: Response) => {
        this.supportController.requestSupport(req, res);
      }
    );

    app.get(
      '/api/technical-support/:id',
      ValidatorMiddleware(technicalSupportSchema.validateId, 'params'),
      (req: Request, res: Response) => {
        this.supportController.filterSupport(req, res);
      }
    );

    app.get('/api/technical-support/', (req: Request, res: Response) => {
      this.supportController.fetchSupport(req, res);
    });

    app.patch(
      '/api/technical-support/:id',
      ValidatorMiddleware(technicalSupportSchema.validateId, 'params'),
      ValidatorMiddleware(technicalSupportSchema.updateSupport, 'body'),
      (req: Request, res: Response) => {
        this.supportController.updateSupport(req, res);
      }
    );
  }
}
