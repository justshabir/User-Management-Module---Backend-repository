import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CommonService from '../modules/common/service';
import { IUser } from '../modules/users/model';

class AuthMiddleWare {
  public static createToken(user: IUser) {
    const accessToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: process.env.TOKEN_VALIDATION_DURATION }
    );
    return accessToken;
  }
  public static verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SEC, (err, user: IUser) => {
        if (err) return CommonService.forbiddenResponse('Token is invalid or has expired!', res);
        req.user = user;
        next();
      });
    } else {
      return CommonService.unAuthorizedResponse('You are not authenticated!', res);
    }
  }
  public static verifyTokenAndAuthorization(req: any, res: Response, next: NextFunction) {
    AuthMiddleWare.verifyToken(req, res, () => {
      if (req.user?.id === req.params.id || req.user?.isAdmin) {
        next();
      } else {
        return CommonService.forbiddenResponse(
          'You are not allowed to perfom this operation!',
          res
        );
      }
    });
  }
  public static verifyTokenAndAdmin(req: any, res: Response, next: NextFunction) {
    AuthMiddleWare.verifyToken(req, res, () => {
      if (req.user?.isAdmin) {
        next();
      } else {
        return CommonService.forbiddenResponse(
          'You are not allowed to perform this operation!',
          res
        );
      }
    });
  }
}

export default AuthMiddleWare;
