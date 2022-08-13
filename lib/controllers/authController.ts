import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import CommonService from '../modules/common/service';
import authMiddleWare from '../middlewares/auth';
import { ClientBaseUrl } from '../config/app';
import UserService from 'modules/users/service';
import { IUser } from 'modules/users/model';

export class AuthController {
  /** Create new instances of needed services here example shown below */
  private userService: UserService = new UserService();

  public createUser(req: Request, res: Response) {
    return CommonService.successResponse('success......', null, res); // replace this with appropriate logic
    // const { password, email, lastName, firstName, phoneNumber = '', gender = '' } = req.body;

    /**
     * this check whether all required fields were send through the request
     * Wtite your account registration logic here.
     * Send email containing confirmation code through whcih users are to use to verify their account
     */
  }

  public loginUser(req: Request, res: Response, next: NextFunction) {
    /**
     * Make use of Passport local strategy here to validate user's credentials and session
     */
  }

  public activateAccount(req: Request, res: Response) {
    /**
     * Use this session to validate and activate user's account
     *  based on the confirmation code sent to their mail upon account registration
     */
  }
  public logoutUser(req: any, res: Response) {
    this.userService.filterUser({ _id: req?.user.id }, (err: any, userData: any) => {
      if (userData) {
        userData.lastVisited = new Date();
        userData.save((err: any, updatedUserData: IUser) => {
          return CommonService.successResponse(
            'Logout successfully',
            { id: updatedUserData._id },
            res
          );
        });
      } else return CommonService.failureResponse('Invalid Session', err, res);
    });
  }

  /**
   *
   * @returns
   * The following methods perform authentication using user's social media account
   */
  public linkedIn() {
    return passport.authenticate('linkedin');
  }
  public linkedInCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('linkedin', function (err, user, info) {
      if (info && Object.keys(info).length) {
        return res.redirect(
          `${ClientBaseUrl}/login?redirect=fail&error=${encodeURIComponent(info.message)}`
        );
      }
      if (err) return next(err);
      req.login(user, function (err) {
        if (err) return next(err);
        if (user) {
          return res.redirect(`${ClientBaseUrl}/login?redirect=success`);
        }
      });
    })(req, res, next);
  }
  public google() {
    return passport.authenticate('google', { scope: ['email', 'profile'] });
  }
  public googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', function (err, user, info) {
      if (info && Object.keys(info).length) {
        return res.redirect(
          `${ClientBaseUrl}/login?redirect=fail&error=${encodeURIComponent(info.message)}`
        );
      }
      if (err) return next(err);
      req.login(user, function (err) {
        if (err) return next(err);
        if (user) {
          return res.redirect(`${ClientBaseUrl}/login?redirect=success`);
        }
      });
    })(req, res, next);
  }
  public microsoft() {
    return passport.authenticate('microsoft', { prompt: 'select_account' });
  }
  public microsoftCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('microsoft', function (err, user, info) {
      if (info && Object.keys(info).length) {
        return res.redirect(
          `${ClientBaseUrl}/login?redirect=fail&error=${encodeURIComponent(info.message)}`
        );
      }
      if (err) return next(err);
      req.login(user, function (err) {
        if (err) return next(err);
        if (user) {
          return res.redirect(`${ClientBaseUrl}/login?redirect=success`);
        }
      });
    })(req, res, next);
  }
  public loginSuccess(req: any, res: Response) {
    if (req?.user) {
      const accessToken = authMiddleWare.createToken(req.user);
      return CommonService.successResponse('Successful', { user: req.user, accessToken }, res);
    } else {
      return CommonService.failureResponse(
        'Login Failed. Unable to obtain access token',
        null,
        res
      );
    }
  }
}
