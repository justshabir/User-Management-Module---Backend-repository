import { Request, Response } from 'express';
import CommonService from '../modules/common/service';
import { IUploadProfileImage } from '../modules/upload/model';
import UploadService from '../modules/upload/service';
import aws from 'aws-sdk';
import { S3Aws } from '../utils/aws';

export class UploadController {
  private uploadService: UploadService = new UploadService();
  private S3: aws.S3 = new S3Aws();
  private s3Params = { Bucket: process.env.AMAZON_S3_PROPERTY_IMAGES_BUCKET, Key: '' };

  public uploadProfileImage(req: any, res: Response) {
    if (req.file?.location && req.file?.key) {
      const imageParams = {
        imageUrl: req.file?.location,
        key: req.file?.key,
      };
      this.uploadService.uploadPhoto(
        imageParams,
        (err: any, uploadedImage: IUploadProfileImage) => {
          if (err) return CommonService.mongoError(err, res);
          if (!uploadedImage) {
            return CommonService.failureResponse('Unable to Upload Image', null, res);
          }
          return CommonService.successResponse(
            'Image Uploaded Successfully!',
            { imageId: uploadedImage?._id },
            res
          );
        }
      );
    } else {
      CommonService.insufficientParameters(res);
    }
  }

  public getImage(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) return CommonService.insufficientParameters(res);
    const query = { _id: id };
    this.uploadService.filterImage(query, (err: any, imageData: IUploadProfileImage) => {
      if (err) {
        CommonService.mongoError(err, res);
      } else if (!imageData) {
        CommonService.failureResponse('Cannot find Image!', null, res);
      } else {
        this.s3Params.Key = imageData.key;
        this.S3.getObject(this.s3Params, (err: any, result: any) => {
          if (err) return CommonService.failureResponse('Cant Load Image!', null, res);
          CommonService.successResponse('Image Fetched Successfully!', result, res);
        });
      }
    });
  }

  public updateImage(req: any, res: Response) {
    const { id } = req.params;
    if (!id || !req.file?.key) {
      CommonService.insufficientParameters(res);
    } else {
      const query = { _id: id };
      this.uploadService.filterImage(query, (err: any, imageData: IUploadProfileImage) => {
        if (err) return CommonService.mongoError(err, res);
        if (!imageData) return CommonService.failureResponse('Cannot get Image!', null, res);
        this.s3Params.Key = imageData.key;
        this.S3.deleteObject(this.s3Params, (err: any, data: any) => {
          if (err) return CommonService.failureResponse('Unable to Delete File!', null, res);
          const updateParams = { imageUrl: req.file?.location, key: req.file?.key };
          this.uploadService.updateImage(
            query,
            updateParams,
            (err: any, updatedImage: IUploadProfileImage) => {
              if (err) return CommonService.mongoError(err, res);
              if (updatedImage) {
                return CommonService.successResponse(
                  'Image Updated Successfully!',
                  { imageId: updatedImage?._id },
                  res
                );
              } else {
                return CommonService.failureResponse('Failed to Update Image!', null, res);
              }
            }
          );
        });
      });
    }
  }

  public deleteImage(req: Request, res: Response) {
    const { id } = req.params;
    const query = { _id: id };
    if (!id) return CommonService.insufficientParameters(res);
    this.uploadService.filterImage(query, (err: any, imageData: IUploadProfileImage) => {
      if (err) return CommonService.mongoError(err, res);
      if (!imageData) return CommonService.failureResponse('Cannot get Image!', null, res);
      this.s3Params.Key = imageData.key;
      this.S3.deleteObject(this.s3Params, (err: any) => {
        if (err) return CommonService.failureResponse('Unable to Delete File!', null, res);
        this.uploadService.deleteImage(query, (err: any, data: any) => {
          if (err) return CommonService.mongoError(err, res);
          if (data) return CommonService.successResponse('Image Deleted Successfully', null, res);
        });
      });
    });
  }
}
