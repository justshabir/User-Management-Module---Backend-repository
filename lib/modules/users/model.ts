import { ModificationNote } from '../common/model';

interface DocumentResult {
  _doc?: any;
}
export interface IUser extends DocumentResult {
  _id?: string;
  name: {
    firstName: string;
    lastName: string;
  };
  isAdmin?: boolean;
  lastVisited?: Date;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  country?: string;
  platformLanguage?: string;
  profession?: string;
  isDeleted?: boolean;
  password?: string;
  status?: string;
  confirmationCode?: string;
  profilePhoto?: string;
  source?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  modificationNotes: ModificationNote[];
  referees?: string[];
  refId: string;
}
