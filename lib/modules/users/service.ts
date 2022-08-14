import { IUser } from './model';
import Users from './schema';

export default class UserService {
  public createUser(userParams: IUser, callback: any) {
    const _session = new Users(userParams);
    _session.save(callback);
  }
  public filterUser(query: any, callback: any, selectPassword?: boolean) {
    if (selectPassword) Users.findOne(query, callback).select('+password');
    else Users.findOne(query, callback);
  }
  public updateUser(userParams: IUser, callback: any) {
    const query = { _id: userParams._id };
    Users.findOneAndUpdate(
      query,
      userParams,
      {
        new: true,
      },
      callback
    );
  }

  public deleteUser(_id: string, callback?: any) {
    const query = { _id };
    Users.deleteOne(query, callback);
  }
}
