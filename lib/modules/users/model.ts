import { ModificationNote } from '../common/model';

export interface IUser {
  _id?: string;
  name: {
    first_name: string;
    last_name: string;
  };
  isAdmin?: boolean;
  platFormLanguage?: string;
  profession?: string;
  country?: string;
  lastVisited?: Date;
  email: string;
  phone_number?: string;
  gender?: string;
  is_deleted?: boolean;
  password?: string;
  status?: string;
  confirmationCode?: string;
  profilePhoto?: string;
  source?: string;
  reset_password_token?: string;
  reset_password_expires?: number;
  modification_notes: ModificationNote[];
}
