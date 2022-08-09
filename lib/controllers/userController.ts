import { Request, Response } from 'express';
import cryptoJs from 'crypto-js';
import {
  insufficientParameters,
  mongoError,
  successResponse,
  failureResponse,
} from '../modules/common/service';
import MailerService from '../modules/mailer/service';
import { IUser } from '../modules/users/model';
import { IConfirmPasswordUpdate } from '../modules/mailer/model';
import UserService from '../modules/users/service';
export class UserController {
  private userService: UserService = new UserService();
  private mailService: MailerService = new MailerService();

  public getUser(req: Request, res: Response) {
    if (req.params.id) {
      const userFilter = { _id: req.params.id };
      this.userService.filterUser(userFilter, (err: any, userData: IUser) => {
        if (err) {
          mongoError(err, res);
        } else {
          successResponse('get user successfully', userData, res);
        }
      });
    } else {
      insufficientParameters(res);
    }
  }

  public updateUser(req: Request, res: Response) {
    const { lastName, firstName, phoneNumber = '', gender = '', isDeleted, platformLanguage, profession, country } = req.body;
    if (
      (req.params.id && (firstName || lastName)) ||
      lastName ||
      firstName ||
      phoneNumber ||
      gender ||
      country ||
      platformLanguage ||
      profession
    ) {
      const user_filter = { _id: req.params.id };
      this.userService.filterUser(user_filter, (err: any, userData: IUser) => {
        if (err) {
          mongoError(err, res);
        } else if (userData) {
          userData.modificationNotes.push({
            modifiedOn: new Date(Date.now()),
            modifiedBy: null,
            modificationNote: 'User data updated',
          });
          const userParams: IUser = {
            _id: req.params.id,
            name:
              firstName || lastName
                ? {
                  firstName: firstName ? firstName : userData.name.firstName,
                  lastName: firstName ? lastName : userData.name.lastName,
                }
                : userData.name,
            phoneNumber: phoneNumber ? phoneNumber : userData.phoneNumber,
            gender: gender ? gender : userData.gender,
            isDeleted: isDeleted ? isDeleted : userData.isDeleted,
            modificationNotes: userData.modificationNotes,
            country: country ? country : userData.country,
            profession: profession ? profession : userData.profession,
            platformLanguage: platformLanguage ? platformLanguage : userData.platformLanguage
          };
          this.userService.updateUser(userParams, (err: any) => {
            if (err) {
              mongoError(err, res);
            } else {
              successResponse('update user successfully', null, res);
            }
          });
        } else {
          failureResponse('invalid user', null, res);
        }
      });
    } else {
      insufficientParameters(res);
    }
  }

  public updateUserPassword(req: Request, res: Response) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (currentPassword && newPassword && confirmPassword) {
      const userFilter = { _id: req.params.id };
      this.userService.filterUser(userFilter, (err: any, userData: IUser) => {
        if (err) {
          mongoError(err, res);
        } else if (userData) {
          if (userData.password === cryptoJs.AES.encrypt(currentPassword, process.env.CRYPTO_JS_PASS_SEC).toString()) {
            if (newPassword === confirmPassword) {
              userData.password = cryptoJs.AES.encrypt(currentPassword, process.env.CRYPTO_JS_PASS_SEC).toString();
              userData.modificationNotes.push({
                modifiedOn: new Date(Date.now()),
                modifiedBy: null,
                modificationNote: 'User password updated',
              });
              this.userService.updateUser(userData, (err: any) => {
                if (err) {
                  mongoError(err, res);
                } else {
                  const mailParams: IConfirmPasswordUpdate = {
                    name: userData?.name.firstName + ' ' + userData?.name.lastName,
                    email: userData?.email,
                  };
                  this.mailService
                    .PasswordUpdateNotification(mailParams)
                    .then((result) => {
                      return successResponse('User password updated successfully', userData, res);
                    })
                    .catch((err) => {
                      return failureResponse('Mailer Service error', err, res);
                    });
                }
              });
            } else {
              failureResponse('Invalid current password provided', null, res);
            }
          }
        } else {
          failureResponse('invalid user', null, res);
        }
      });
    } else {
      // error response if some fields are missing in request body
      return insufficientParameters(res);
    }

  }

  public deleteUser(req: Request, res: Response) {
    if (req.params.id) {
      this.userService.deleteUser(req.params.id, (err: any, deleteDetails) => {
        if (err) {
          mongoError(err, res);
        } else if (deleteDetails.deletedCount !== 0) {
          successResponse('delete user successfully', null, res);
        } else {
          failureResponse('invalid user', null, res);
        }
      });
    } else {
      insufficientParameters(res);
    }
  }
}
