import mongoose from 'mongoose';
import { ModificationNote } from '../common/model';
const { Schema } = mongoose;

const schema = new Schema(
  {
    name: {
      type: {
        firstName: String,
        lastName: String,
      },
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: [true, 'email already registered'],
    },
    country: {
      type: String,
      default: null,
    },
    platformLanguage: {
      type: String,
      default: null,
    },
    profession: {
      type: String,
      default: null,
    },
    password: { type: String, select: false },
    phoneNumber: String,
    gender: String,

    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastVisited: { type: Date, default: new Date() },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
    status: { type: String, enum: ['Pending', 'Active', 'Suspended'], default: 'Pending' },
    confirmationCode: { type: String },
    profilePhoto: { type: Schema.Types.ObjectId, ref: 'Image' },
    source: {
      type: String,
      enum: ['local', 'google', 'linkedin', 'microsoft'],
      default: 'local',
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    modificationNotes: [ModificationNote],
    refId: {
      type: String,
      required: [true, 'referral ID required'],
      require: true,
    },
    referrals: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('users', schema);
