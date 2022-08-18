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
import { uuid } from 'uuidv4';
import { isRef } from 'joi';
export class AuthController {
  private userService: UserService = new UserService();
  private mailService: MailerService = new MailerService();

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

  public createUser(req: Request, res: Response) {
    const { password, email, lastName, firstName, refId } = req.body;
    if (firstName && lastName && email && password ) {
      const hashedPassword = cryptoJs.AES.encrypt(
        password,
        process.env.CRYPTO_JS_PASS_SEC
      ).toString();
      const secret = email + '_' + new Date().getTime();
      const token = jwt.sign({ email }, secret);

        //checks for referrer id
       this.userService.filterUser(
        { refId: refId}, (err: any, Ref: IUser ) => {   
              //if no refId or no valid refId user
              if(!Ref){
    const userParams : IUser = {
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
    //if there's a refId/referrer then do this.
    } else{
    const userParams : IUser = {
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
          const mailParams: IConfirmationMail = {
            name: userData?.name.firstName + ' ' + userData?.name.lastName,
            confirmationCode: userData.confirmationCode,
            email,
          };
      
       this.userService.filterUser({refId: refId}, (err: any, addRef: IUser )=>{
              if (err) {
                CommonService.mongoError(err, res)
              }
              // console.log(addRef)
           addRef.referrees.push(userData._id) 
           this.userService.updateUser(addRef, (err: any) => {
                if (err) {
                  CommonService.mongoError(err, res);          
                }
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
          }) 
       })//filter
      }  
      })
   }
  })
    
}else {
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
      const accessToken = authMiddleWare.createToken(user);
      const { password, ...rest } = user._doc;
      return CommonService.successResponse(
        'Login Successful',
        { user: { ...rest }, accessToken },
        res
      );
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
              { id: updatedUserData._id },
              res
            );
          } else return CommonService.failureResponse('Account Verification Failed', err, res);
        });
      }
    );
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
}
