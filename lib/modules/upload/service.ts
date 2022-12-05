import { IUploadProfileImage } from './model';
import { Image } from './schema';
export default class UploadService {
  public filterImage(query: Partial<IUploadProfileImage>, callback: any) {
    Image.findOne(query, callback);
  }

  public uploadPhoto(uploadParams: IUploadProfileImage, callback: any) {
    const uploadImage = new Image(uploadParams);
    uploadImage.save(callback);
  }

  public updateImage(
    query: Partial<IUploadProfileImage>,
    updateParams: IUploadProfileImage,
    callback: any
  ) {
    Image.findOneAndUpdate(query, updateParams, { new: true }, callback);
  }

  public deleteImage(query: Partial<IUploadProfileImage>, callback: any) {
    Image.deleteOne(query, callback);
  }
}
