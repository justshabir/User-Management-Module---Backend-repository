import mongoose from 'mongoose';
import { ModificationNote } from '../common/model';
const { Schema } = mongoose;

const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      unique: true,
      ref: 'User',
    },
    general: {
      showMyConnectionTime: {
        type: Boolean,
        default: false,
      },
      confirmWhenLeavingAMeeting: {
        type: Boolean,
        default: false,
      },
      showSubtitles: {
        type: Boolean,
        default: false,
      },
      showNonVideoParticipants: {
        type: Boolean,
        default: false,
      },
    },
    audio: {
      muteMicrophone: {
        type: Boolean,
        default: false,
      },
      autoConnectAudio: {
        type: Boolean,
        default: false,
      },
      useOriginalAudio: {
        type: Boolean,
        default: false,
      },
    },
    video: {
      turnOffVideo: {
        type: Boolean,
        default: false,
      },
    },
    modificationNotes: [ModificationNote],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('userPermissions', schema);
