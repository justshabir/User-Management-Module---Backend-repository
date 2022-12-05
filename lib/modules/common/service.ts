import { Response } from 'express';
import { responseStatusCodes } from './model';

class CommonService {
  public static successResponse(message: string, DATA: any, res: Response) {
    res.status(responseStatusCodes.success).json({
      STATUS: 'SUCCESS',
      MESSAGE: message,
      DATA,
    });
  }
  public static failureResponse(message: string, DATA: any, res: Response) {
    res.status(responseStatusCodes.bad_request).json({
      STATUS: 'FAILURE',
      MESSAGE: message,
      DATA,
    });
  }
  public static unAuthorizedResponse(message: string, res: Response) {
    res.status(responseStatusCodes.unauthorized).json({
      STATUS: 'FAILURE',
      MESSAGE: message,
    });
  }
  public static forbiddenResponse(message: string, res: Response) {
    res.status(responseStatusCodes.forbidden).json({
      STATUS: 'FAILURE',
      MESSAGE: message,
    });
  }
  public static UnprocessableResponse(message: string, res: Response) {
    res.status(responseStatusCodes.unprocessable).json({
      STATUS: 'FAILURE',
      MESSAGE: message,
    });
  }
  public static insufficientParameters(res: Response) {
    res.status(responseStatusCodes.bad_request).json({
      STATUS: 'FAILURE',
      MESSAGE: 'Insufficient parameters',
      DATA: {},
    });
  }
  public static mongoError(err: any, res: Response) {
    res.status(responseStatusCodes.internal_server_error).json({
      STATUS: 'FAILURE',
      MESSAGE: 'MongoDB error',
      DATA: err,
    });
  }
}

export default CommonService;
