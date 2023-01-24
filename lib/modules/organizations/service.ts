import { IOrganizations } from './model';
import Organizations from './schema';

export default class OrgService {
  public async createOrg(userParams: IOrganizations) {
    const _session = new Organizations(userParams);
    return await _session.save();
  }
  public filterOrg(query: any, callback: any) {
    Organizations.findOne(query, callback);
  }
  public updateOrg(userParams: IOrganizations, callback: any) {
    const query = { _id: userParams._id };
    Organizations.findOneAndUpdate(
      query,
      userParams,
      {
        new: true,
      },
      callback
    );
  }
  public deleteOrg(_id: string, callback?: any) {
    const query = { _id };
    Organizations.deleteOne(query, callback);
  }
}
