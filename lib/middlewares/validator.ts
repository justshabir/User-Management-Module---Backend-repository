import { NextFunction, Request, Response } from 'express';
import CommonService from '../modules/common/service';
const ValidatorMiddleware = (schema: any, property: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      const { details } = error;
      const message =
        details && Array.isArray(details) ? details.map((i: any) => i.message).join(',') : details;
      return CommonService.UnprocessableResponse(message, res);
    }
    next();
  };
};
export default ValidatorMiddleware;
