import mongoose from 'mongoose';
const { Schema } = mongoose;
const imageSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    key: { type: String }
  },
  { timestamps: true }
);
export const Image = mongoose.model('Image', imageSchema);
