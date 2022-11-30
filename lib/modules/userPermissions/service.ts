import { IUserPermissions } from './model';
import UserPermissions from './schema';

export default class UserPermissionsService {
  public createUserPermissions(permissionParams: IUserPermissions, callback: any) {
    const _session = new UserPermissions(permissionParams);
    _session.save(callback);
  }
  public filterUser(query: any, callback: any) {
    UserPermissions.findOne(query, callback);
  }
  public updatePermissions(permissionParams: IUserPermissions, callback: any) {
    const query = { user: permissionParams.user };
    UserPermissions.findOneAndUpdate(
      query,
      permissionParams,
      {
        new: true,
      },
      callback
    );
  }
}
