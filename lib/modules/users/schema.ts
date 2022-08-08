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
    password: { type: String, select: false },
    phone_number: String,
    gender: String,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastVisited: { type: Date, default: new Date() },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    status: { type: String, enum: ['Pending', 'Active'], default: 'Pending' },
    confirmationCode: { type: String },
    profilePhoto: { type: String },
    source: {
      type: String,
      enum: ['local', 'google', 'linkedin', 'microsoft'],
      default: 'local',
    },
    reset_password_token: {
      type: String,
    },
    reset_password_expires: {
      type: Date,
    },
    modification_notes: [ModificationNote],
  });

export default mongoose.model('users', schema);
