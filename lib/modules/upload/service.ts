import { IUploadProfileImage } from './model';
import { Image } from './schema';
export default class UploadService {
  public uploadProfilePhoto(imageData: IUploadProfileImage, callback: any) {
    const uploadImage = new Image(imageData);
    uploadImage.save(callback);
  }
}
