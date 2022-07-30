import mongoose from 'mongoose';
import { ModificationNote } from '../common/model';

const { Schema } = mongoose;

const schema = new Schema(
  {
    name: {
      type: {
        first_name: String,
        last_name: String,
      },
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: [true, 'email already registered'],
    },
    password: { type: String, select: false },
    phone_number: String,
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
    profilePhoto: { type: String },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('users', schema);
