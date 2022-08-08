import { ModificationNote } from '../common/model';

export interface IUser {
  is_deleted: any;
  modification_notes: any;
  _id?: string;
  name: {
    firstName: string;
    lastName: string;
  };
  isAdmin?: boolean;
  platFormLanguage?: string;
  profession?: string;
  country?: string;
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
}
