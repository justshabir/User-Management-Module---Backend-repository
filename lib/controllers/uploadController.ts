import { Request, Response } from 'express';
import fs from 'fs';
import CommonService from '../modules/common/service';
import { IUploadProfileImage } from '../modules/upload/model';
import UploadService from '../modules/upload/service';
export class UploadController {
  private UploadService: UploadService = new UploadService();
  public uploadProfileImage(req: Request, res: Response) {
    if (!req.file) return CommonService.failureResponse('Please Upload an image', null, res);
    const image = {
      data: fs.readFileSync(req.file.path),
      contentType: 'image/png',
    };
    this.UploadService.uploadProfilePhoto(
      { image },
      (err: any, uploadedImage: IUploadProfileImage) => {
        if (err) return CommonService.mongoError(err, res);
        return CommonService.successResponse(
          'Image Uploaded successfully',
          { id: uploadedImage._id },
          res
        );
      }
    );
  }
}
