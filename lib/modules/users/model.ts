import { ModificationNote } from '../common/model';

export interface IUser {
  _id?: string;
  name: {
    first_name: string;
    last_name: string;
  };
  isAdmin?: boolean;
  lastVisited?: Date;
  email: string;
  phone_number?: string;
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
}
