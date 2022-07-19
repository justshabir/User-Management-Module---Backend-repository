import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { successResponse, failureResponse } from '../modules/common/service';
import authMiddleWare from '../middlewares/auth';
import { ClientBaseUrl } from '../config/app';

export class AuthController {
  /** Create new instances of needed services here example shown below */
  // private user_service: UserService = new UserService();

  public create_user(req: Request, res: Response) {
    // const { password, email, last_name, first_name, phone_number = '', gender = '' } = req.body;
    /**
     * this check whether all required fields were send through the request
     * Wtite your account registration logic here.
     * Send email containing confirmation code through whcih users are to use to verify their account
     */
  }

  public login_user(req: Request, res: Response, next: NextFunction) {
    /**
     * Make use of Passport local strategy here to validate user's credentials and session
     */
  }

  public activate_account(req: Request, res: Response) {
    /**
     * Use this session to validate and activate user's account
     *  based on the confirmation code sent to their mail upon account registration
     */
  }
  public logout_user(req: any, res: Response) {
    /**
     * Write the neccessary logic to logout a user
     * It is important to update the `lastvisited`
     * property on the user's object to the current date
     */
  }

  /**
   *
   * @returns
   * The following methods perform authentication using user's social media account
   */
  public linked_in() {
    return passport.authenticate('linkedin');
  }
  public linked_in_callback(req: Request, res: Response, next: NextFunction) {
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
  public google_callback(req: Request, res: Response, next: NextFunction) {
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
  public microsoft_callback(req: Request, res: Response, next: NextFunction) {
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
  public login_success(req: any, res: Response) {
    if (req?.user) {
      const accessToken = authMiddleWare.createToken(req.user);
      return successResponse('Successful', { user: req.user, accessToken }, res);
    } else {
      return failureResponse('Login Failed. Unable to obtain access token', null, res);
    }
  }
}
