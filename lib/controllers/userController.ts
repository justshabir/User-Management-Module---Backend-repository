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
  private user_service: UserService = new UserService();
  private mail_service: MailerService = new MailerService();

  public getUser(req: Request, res: Response) {
    if (req.params.id) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, userData: IUser) => {
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
    const { email, lastName, firstName, phoneNumber = '', gender = '', isDeleted } = req.body;
    if (
      (req.params.id && (firstName || lastName)) ||
      lastName ||
      firstName ||
      email ||
      phoneNumber ||
      gender
    ) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, userData: IUser) => {
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
            email: email ? email : userData.email,
            phoneNumber: phoneNumber ? phoneNumber : userData.phoneNumber,
            gender: gender ? gender : userData.gender,
            isDeleted: isDeleted ? isDeleted : userData.isDeleted,
            modificationNotes: userData.modificationNotes,
          };
          this.user_service.updateUser(userParams, (err: any) => {
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
    const { current_password, new_password, confirm_password } = req.body;

    if (current_password && new_password && confirm_password) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
        if (err) {
          mongoError(err, res);
        } else if (user_data) {
          if (user_data.password === cryptoJs.AES.encrypt(current_password, process.env.CRYPTO_JS_PASS_SEC).toString()) {
            if (new_password === confirm_password) {
              user_data.password = cryptoJs.AES.encrypt(current_password, process.env.CRYPTO_JS_PASS_SEC).toString();
              user_data.modificationNotes.push({
                modifiedOn: new Date(Date.now()),
                modifiedBy: null,
                modificationNote: 'User password updated',
              });
              this.user_service.updateUser(user_data, (err: any) => {
                if (err) {
                  mongoError(err, res);
                } else {
                  const mail_params: IConfirmPasswordUpdate = {
                    name: user_data?.name.firstName + ' ' + user_data?.name.lastName,
                    email: user_data?.email,
                  };
                  this.mail_service
                    .PasswordUpdateNotification(mail_params)
                    .then((result) => {
                      return successResponse('User password updated successfully', user_data, res);
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
      this.user_service.deleteUser(req.params.id, (err: any, delete_details) => {
        if (err) {
          mongoError(err, res);
        } else if (delete_details.deletedCount !== 0) {
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
