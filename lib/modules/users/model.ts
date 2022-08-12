
import { ModificationNote } from '../common/model';

export interface IUser {
  _id?: string;
  name: {
    firstName: string;
    lastName: string;
  };
  isAdmin?: boolean;
  lastVisited?: Date;
  email: string;
  phoneNumber?: string;
  gender?: string;
  isDeleted?: boolean;
  password?: string;
  status?: string;
  confirmationCode?: string;
  profilePhoto?: string;
  source?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  modificationNotes: ModificationNote[];
  referrals: any[];
  refId?: string;
}
