import { ModificationNote } from '../common/model';

export interface IUserPermissions {
  _id?: string;
  user: string;
  general?: {
    showMyConnectionTime?: boolean;
    confirmWhenLeavingAMeeting?: boolean;
    showSubtitles?: boolean;
    showNonVideoParticipants?: boolean;
  };
  audio?: {
    muteMicrophone?: boolean;
    autoConnectAudio?: boolean;
    useOriginalAudio?: boolean;
  };
  video?: {
    turnOffVideo?: boolean;
  };
  modificationNotes: ModificationNote[];
}
