import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import CommonService from '../modules/common/service';
import MailerService from '../modules/mailer/service';
import SupportService from '../modules/support/service';
import { IRequestSupport } from '../modules/mailer/model';
import { IPage, ITechnicalSupport, IUpdateTechnicalSupport } from '../modules/support/model';

export class SupportController {
  private mailService: MailerService = new MailerService();
  private supportService: SupportService = new SupportService();

  public requestSupport(req: any, res: Response) {
    const { firstName, lastName, email, subject, message } = req.body;
    const ticketId = `ZUM${uuid().toUpperCase()}`;
    const request: IRequestSupport = {
      ticketId,
      name: `${firstName + ' ' + lastName}`,
      email,
      subject,
      message,
      file: req?.file,
    };
    const requestDetails: ITechnicalSupport = {
      _id: ticketId,
      email,
      subject,
      message,
      file: req?.file && { key: req?.file?.key, location: req?.file?.location },
    };

    this.mailService
      .requestTechnicalSupport(request)
      .then(() => {
        this.supportService.createSupport(
          requestDetails,
          (err: any, supportData: IRequestSupport) => {
            if (err) return CommonService.mongoError(err, res);
            if (!supportData) {
              return CommonService.failureResponse('Unable process request', null, res);
            } else {
              this.mailService
                .sendTechnicalSupportConfirmation(request)
                .then(() => {
                  return CommonService.successResponse('Request sent Successfully!', null, res);
                })
                .catch(() => {
                  return CommonService.failureResponse('Mailer Service error', null, res);
                });
            }
          }
        );
      })
      .catch(() => {
        return CommonService.failureResponse('Mailer Service error', null, res);
      });
  }

  public filterSupport(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return CommonService.insufficientParameters(res);
    }
    const query = { _id: id };
    this.supportService.filterSupport(query, (err, supportData: ITechnicalSupport) => {
      if (err) return CommonService.mongoError(err, res);
      if (!supportData) {
        return CommonService.failureResponse('Unable process request', null, res);
      }
      return CommonService.successResponse('Request Successful', supportData, res);
    });
  }

  public fetchSupport(req: Request, res: Response) {
    const limit = 5;
    const skip = (Number(req.query.page) - 1) * limit || 0;
    const pageDetails: IPage = { skip, limit };

    this.supportService.fetchAllSupport(pageDetails, (err: any, supportData: ITechnicalSupport) => {
      if (err) return CommonService.mongoError(err, res);
      if (!supportData) return CommonService.failureResponse('Unable process request', null, res);
      return CommonService.successResponse('Request Successful', supportData, res);
    });
  }

  public updateSupport(req: any, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || status === null) return CommonService.insufficientParameters(res);
    const query = { _id: id };
    this.supportService.filterSupport(query, (err: any, supportData: ITechnicalSupport) => {
      if (err) return CommonService.mongoError(err, res);
      if (!supportData) {
        return CommonService.failureResponse('Unable process request', null, res);
      }

      if (!status === supportData.resolved) {
        const supportParams: IUpdateTechnicalSupport = {
          resolvedAt: status ? new Date() : supportData.resolvedAt,
          resolved: status,
        };
        this.supportService.updateSupport(
          query,
          supportParams,
          (err: any, supportData: ITechnicalSupport) => {
            if (err) return CommonService.mongoError(err, res);
            if (!supportData) {
              return CommonService.failureResponse('Unable process request', null, res);
            }
            return CommonService.successResponse('Request sent Successfully!', supportData, res);
          }
        );
      } else {
        return CommonService.successResponse('No update', null, res);
      }
    });
  }
}
