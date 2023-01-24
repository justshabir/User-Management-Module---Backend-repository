import mongoose from 'mongoose';
import { accountStatusEnum } from '../../utils/enums';
import { ModificationNote } from '../common/model';
const { Schema } = mongoose;

const schema = new Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Name of business is required'],
      unique: [true, 'Business name already token'],
    },
    businessEmail: {
      type: String,
      required: [true, 'email required'],
      unique: [true, 'email already registered'],
    },
    businessOwner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    businessSize: Number,
    country: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    industry: {
      type: String,
      default: null,
    },
    businessPhoneNumber: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [...Object.values(accountStatusEnum)],
      default: accountStatusEnum.PENDING,
    },
    confirmationCode: { type: String },
    businessLogo: { type: Schema.Types.ObjectId, ref: 'Image' },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    modificationNotes: [ModificationNote],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('organizations', schema);
