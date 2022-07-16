import { IUser } from './model';
import Users from './schema';

export default class UserService {
  public createUser(user_params: IUser, callback: any) {
    const _session = new Users(user_params);
    _session.save(callback);
  }
  public filterUser(query: any, callback: any) {
    Users.findOne(query, callback).select('+password');
  }
  public updateUser(user_params: IUser, callback: any) {
    const query = { _id: user_params._id };
    Users.findOneAndUpdate(query, user_params, callback);
  }

  public deleteUser(_id: string, callback?: any) {
    const query = { _id };
    Users.deleteOne(query, callback);
  }
}
