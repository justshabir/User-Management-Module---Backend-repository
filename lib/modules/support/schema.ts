import mongoose, { Schema } from 'mongoose';

const technicalSupportSchema = new Schema({
  _id: { type: String, required: [true, 'Ticket id is required'] },
  email: {
    type: String,
    required: [true, 'email required'],
  },
  subject: { type: String },
  message: { type: String },
  receivedAt: {
    type: Date,
    default: new Date(),
  },
  file: {
    type: {
      key: String,
      location: String,
    },
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: { type: Date },
});

export const Support = mongoose.model('Support', technicalSupportSchema);
