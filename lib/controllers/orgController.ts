import OrgService from '../modules/organizations/service';
import { NextFunction, Request, Response } from 'express';
import CommonService from '../modules/common/service';
import { IOrganizations } from 'modules/organizations/model';
export class OrgController {
  private orgService: OrgService = new OrgService();

  public async register(req: Request, res: Response) {
    try {
      const newOrgDetails: IOrganizations = req.body;
      const newOrg = await this.orgService.createOrg(newOrgDetails);
      return CommonService.successResponse('Business created successfully', newOrg, res);
    } catch (err) {
      if (err?.keyValue && (err?.keyValue?.businessEmail || err?.keyValue?.businessName)) {
        return CommonService.failureResponse(
          `User already exist`,
          { conflictProperty: err?.keyValue?.businessEmail || err?.keyValue?.businessName },
          res
        );
      } else {
        return CommonService.mongoError(err, res);
      }
    }
  }
}
