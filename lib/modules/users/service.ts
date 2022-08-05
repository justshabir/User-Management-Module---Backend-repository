import { IUser } from './model';
import Users from './schema';

export default class UserService {
  public createUser(userParams: IUser, callback: any) {
    const _session = new Users(userParams);
    _session.save(callback);
  }
  public filterUser(query: any, callback: any) {
    Users.findOne(query, callback).select('+password');
  }
  public updateUser(userParams: IUser, callback: any) {
    const query = { _id: userParams._id };
    Users.findOneAndUpdate(query, userParams, callback);
  }

  public deleteUser(_id: string, callback?: any) {
    const query = { _id };
    Users.deleteOne(query, callback);
  }
}
