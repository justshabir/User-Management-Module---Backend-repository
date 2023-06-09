import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import CommonService from '../modules/common/service';
import authMiddleWare from '../middlewares/auth';
import { ClientBaseUrl } from '../config/app';
import UserService from '../modules/users/service';
import { IUser } from '../modules/users/model';
import MailerService from '../modules/mailer/service';
import cryptoJs from 'crypto-js';
import { IConfirmationMail } from '../modules/mailer/model';
import jwt from 'jsonwebtoken';
import { accountStatusEnum } from '../utils/enums';
import { v4 as uuid } from 'uuid';
import UserPermissionsService from '../modules/userPermissions/service';
import { IUserPermissions } from '../modules/userPermissions/model';
import { MongooseError } from 'mongoose';
export class AuthController {
  private userService: UserService = new UserService();
  private mailService: MailerService = new MailerService();
  private userPermissionsService: UserPermissionsService = new UserPermissionsService();

  public loginSuccess(req: Request, res: Response) {
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

  public createUser(req: Request, res: Response) {
    const { password, email, lastName, firstName, refId = '' } = req.body;
    if (firstName && lastName && email && password) {
      const hashedPassword = cryptoJs.AES.encrypt(
        password,
        process.env.CRYPTO_JS_PASS_SEC
      ).toString();
      const secret = email + '_' + new Date().getTime();
      const token = jwt.sign({ email }, secret);

      const userParams: IUser = {
        name: {
          firstName: firstName,
          lastName: lastName,
        },
        email: email,
        password: hashedPassword,
        confirmationCode: token,
        refId: uuid(),
        modificationNotes: [
          {
            modifiedOn: new Date(Date.now()),
            modifiedBy: null,
            modificationNote: 'New user created',
          },
        ],
      };

      this.userService.createUser(userParams, (err: any, userData: IUser) => {
        if (err) {
          if (err?.keyValue && err?.keyValue?.email) {
            CommonService.failureResponse(
              `User already exist`,
              { username: err?.keyValue?.email },
              res
            );
          } else {
            return CommonService.mongoError(err, res);
          }
        } else {
          // If the exist a refId, find the user with this refId and update the referees property by adding the new user's id
          if (refId && userData) {
            this.userService.filterUser({ refId }, (err: any, RefUser: any) => {
              if (RefUser) {
                RefUser.referees.push(userData._id);
                RefUser.save();
              }
            });
          }
          const permissionParams: IUserPermissions = {
            user: userData._id,
            modificationNotes: [
              {
                modifiedOn: new Date(Date.now()),
                modifiedBy: null,
                modificationNote: 'New user permissions created',
              },
            ],
          };
          this.userPermissionsService.createUserPermissions(permissionParams, (err: any) => {
            if (err) {
              this.userService.deleteUser(userData._id, () => {
                return CommonService.mongoError(err, res);
              });
            } else {
              const mailParams: IConfirmationMail = {
                name: userData?.name.firstName + ' ' + userData?.name.lastName,
                confirmationCode: userData.confirmationCode,
                email,
              };
              this.mailService
                .sendAccountActivationRequest(mailParams)
                .then((result) => {
                  return CommonService.successResponse(
                    'User created successfully',
                    { id: userData._id },
                    res
                  );
                })
                .catch((err) => {
                  this.userService.deleteUser(userData._id, () => {
                    return CommonService.failureResponse('Mailer Service error', err, res);
                  });
                });
            }
          });
        }
      });
    } else {
      // error response if some fields are missing in request body
      return CommonService.insufficientParameters(res);
    }
  }

  public loginUser(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', function (err, user: IUser | any, info) {
      if (info && Object.keys(info).length > 0) {
        return CommonService.failureResponse(info?.message, null, res);
      }
      if (err) {
        return next(err);
      }
      if (!user) {
        return CommonService.unAuthorizedResponse('Wrong Credentials!', res);
      }
      if (user.status !== accountStatusEnum.ACTIVE) {
        return CommonService.unAuthorizedResponse(
          'Pending Account. Please Verify Your Email!',
          res
        );
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        const accessToken = authMiddleWare.createToken(user);
        user.populate('profilePhoto', (err: any, userData: any) => {
          if (err) return CommonService.mongoError(err, res);
          const profilePhoto = userData.profilePhoto ? userData.profilePhoto?.imageUrl : '';
          const { password, ...rest } = user._doc;
          return CommonService.successResponse(
            'Successful',
            { user: { ...rest, profilePhoto }, accessToken },
            res
          );
        });
      });
    })(req, res, next);
  }

  public activateAccount(req: Request, res: Response) {
    this.userService.filterUser(
      { confirmationCode: req.params.confirmationCode },
      (err: any, userData: IUser | any) => {
        if (!userData || err) {
          return CommonService.failureResponse(
            'Confirmation code is invalid or has expired',
            err,
            res
          );
        }
        userData.status = accountStatusEnum.ACTIVE;
        userData.confirmationCode = undefined;
        userData.save((err: any, updatedUserData: IUser) => {
          if (updatedUserData) {
            return CommonService.successResponse(
              'Account verified',
              { id: updatedUserData?._id, email: updatedUserData.email },
              res
            );
          } else return CommonService.failureResponse('Account Verification Failed', err, res);
        });
      }
    );
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
          `${ClientBaseUrl}/auth/login?redirect=fail&error=${encodeURIComponent(info.message)}`
        );
      }
      if (err) return next(err);
      req.login(user, function (err) {
        if (err) return next(err);
        if (user) {
          return res.redirect(`${ClientBaseUrl}/auth/login?redirect=success`);
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
          `${ClientBaseUrl}/auth/login?redirect=fail&error=${encodeURIComponent(info.message)}`
        );
      }
      if (err) return next(err);
      req.login(user, function (err) {
        if (err) return next(err);
        if (user) {
          return res.redirect(`${ClientBaseUrl}/auth/login?redirect=success`);
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
          `${ClientBaseUrl}/auth/login?redirect=fail&error=${encodeURIComponent(info.message)}`
        );
      }
      if (err) return next(err);
      req.login(user, function (err) {
        if (err) return next(err);
        if (user) {
          return res.redirect(`${ClientBaseUrl}/auth/login?redirect=success`);
        }
      });
    })(req, res, next);
  }

  //logout
  public logoutUser(req: Request, res: Response) {
    this.userService.filterUser({ _id: req?.user?.id }, (err: any, userData: any) => {
      if (userData) {
        userData.lastVisited = new Date();
        userData.save();
      }
      req.logOut((err) => {
        //@ts-ignore
        req.session.passport = undefined;
        req.session.touch();
        req.session.save();
        req.session.destroy(() => {});
      });
      return CommonService.successResponse('Logout successfully', null, res);
    });
  }

  public checkLoginStatus(req: Request, res: Response) {
    const session = req.session;
    //@ts-ignore
    const user = session ? session.passport?.user : null;
    if (Boolean(session) && Boolean(user)) {
      this.userService.filterUser({ _id: user }, (err: MongooseError, currentUser: IUser) => {
        // console.log('res', err, currentUser);

        if (currentUser) return CommonService.successResponse('logged In', currentUser, res);
      });
    }
    CommonService.successResponse('Not logged in', { loggedIn: false }, res);
  }
}
