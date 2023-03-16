import { IUser } from '../users/model';
import Users from '../users/schema';

export default class ReferralService {
  public fetchRefCode(referralParams: Partial<IUser>, callback: any) {
    Users.findOne(referralParams, callback).select(['_id', 'refId', 'name']);
  }
}
