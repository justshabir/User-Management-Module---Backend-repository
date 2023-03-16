import { IPage, ITechnicalSupport, IUpdateTechnicalSupport } from './model';
import { Support } from './schema';
export default class SupportService {
  public createSupport(supportParams: ITechnicalSupport, callback: any) {
    const requestSupport = new Support(supportParams);
    requestSupport.save(callback);
  }

  public filterSupport(query: Partial<ITechnicalSupport>, callback: any) {
    Support.findOne(query, callback);
  }

  public updateSupport(
    query: Partial<ITechnicalSupport>,
    updateParams: IUpdateTechnicalSupport,
    callback: any
  ) {
    Support.findOneAndUpdate(query, updateParams, { new: true }, callback);
  }
  public deleteSupport(_id: string, callback: any) {
    const query = { _id };
    Support.findOneAndDelete(query, callback);
  }

  public fetchAllSupport(pageDetails: IPage, callback: any) {
    Support.find(callback).skip(pageDetails.skip).limit(pageDetails.limit).sort();
  }
}
