import { Request, Response } from 'express';
import CommonService from '../modules/common/service';
import MailerService from '../modules/mailer/service';
import ReferralService from '../modules/referral/service';
import { IReferral } from '../modules/referral/model';
import { ISendReferral } from 'modules/mailer/model';

export class ReferralController {
  private mailService: MailerService = new MailerService();
  private referralService: ReferralService = new ReferralService();

  public getReferralId(req: Request, res: Response) {
    const userFilter = { _id: req.params.id };

    if (!userFilter) {
      return CommonService.insufficientParameters(res);
    }
    this.referralService.fetchRefCode(userFilter, (err: any, referralData: IReferral) => {
      if (err) return CommonService.mongoError(err, res);
      if (!referralData) {
        return CommonService.failureResponse('Unable to fetch referral', null, res);
      } else {
        return CommonService.successResponse(
          'Referral id fetched Successfully!',
          { refId: referralData?.refId, name:referralData?.name },
          res
        );
      }
    });
  }

  public sendReferral(req: Request, res: Response) {
    const referralDetails: ISendReferral = req.body;
    if (!referralDetails) {
      return CommonService.insufficientParameters(res);
    }
     this.mailService
       .sendReferral(referralDetails)
       .then(() => {
         return CommonService.successResponse('Message Sent Successfully', null, res);
       })
       .catch(() => {
         return CommonService.failureResponse('Mailer Service error', null, res);
       });
  }
}
