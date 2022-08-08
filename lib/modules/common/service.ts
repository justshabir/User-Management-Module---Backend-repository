import { Response } from 'express';
import { response_status_codes } from './model';

export function successResponse(message: string, DATA: any, res: Response) {
  res.status(response_status_codes.success).json({
    STATUS: 'SUCCESS',
    MESSAGE: message,
    DATA,
  });
}

export function failureResponse(message: string, DATA: any, res: Response) {
  res.status(response_status_codes.bad_request).json({
    STATUS: 'FAILURE',
    MESSAGE: message,
    DATA,
  });
}
export function unAuthorizedResponse(message: string, res: Response) {
  res.status(response_status_codes.unauthorized).json({
    STATUS: 'FAILURE',
    MESSAGE: message,
  });
}
export function forbiddenResponse(message: string, res: Response) {
  res.status(response_status_codes.forbidden).json({
    STATUS: 'FAILURE',
    MESSAGE: message,
  });
}

export function insufficientParameters(res: Response) {
  res.status(response_status_codes.bad_request).json({
    STATUS: 'FAILURE',
    MESSAGE: 'Insufficient parameters',
    DATA: {},
  });
}

export function mongoError(err: any, res: Response) {
  res.status(response_status_codes.iinternalServerError).json({
    STATUS: 'FAILURE',
    MESSAGE: 'MongoDB error',
    DATA: err,
  });
}
