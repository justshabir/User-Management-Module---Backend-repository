export interface IUploadProfileImage {
  _id?: string;
  image: {
    data: Buffer;
    contentType: string;
  };
}
