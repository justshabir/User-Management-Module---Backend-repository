import mongoose from 'mongoose';
const { Schema } = mongoose;
const imageSchema = new Schema(
  {
    image: {
      data: Buffer,
      contentType: String,
    },
  },
  {
    timestamps: true,
  }
);
export const Image = mongoose.model('Image', imageSchema);
