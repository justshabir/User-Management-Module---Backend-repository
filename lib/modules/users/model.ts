
import { ModificationNote } from '../common/model';

export interface IUser {
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
<<<<<<< HEAD
  referrals: any[];
  refId?: string;
}
=======
}
>>>>>>> ae11590e379ad8e947b39d9a24eb456dccf9c273
