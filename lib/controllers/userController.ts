import { Request, Response } from 'express';

import cryptoJs from 'crypto-js';
import CommonService from '../modules/common/service';
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
          CommonService.mongoError(err, res);
        } else {
          CommonService.successResponse('get user successfull', userData, res);
        }
      });
    } else {
      CommonService.insufficientParameters(res);
    }
  }
  public updateUser(req: Request | any, res: Response) {
    const {
      lastName,
      firstName,
      phoneNumber = '',
      gender = '',
      platformLanguage,
      profession,
      country,
      profilePhoto = '',
    } = req.body;
    //no need for req.params.id we will use joi validator
    if (
      firstName ||
      lastName ||
      lastName ||
      firstName ||
      phoneNumber ||
      gender ||
      country ||
      platformLanguage ||
      profession ||
      profilePhoto
    ) {
      const userFilter = { _id: req.params.id };
      this.userService.filterUser(userFilter, (err: any, userData: IUser) => {
        if (err) {
          CommonService.mongoError(err, res);
        } else if (userData) {
          userData.modificationNotes.push({
            modifiedOn: new Date(),
            modifiedBy: req.user.id,
            modificationNote: 'User Profile Updated Successfully',
          });
          const userParams: IUser = {
            _id: req.params.id,
            name:
              firstName || lastName
                ? {
                    firstName: firstName ? firstName : userData.name.firstName,
                    lastName: lastName ? lastName : userData.name.lastName,
                  }
                : userData.name,
            phoneNumber: phoneNumber ? phoneNumber : userData.phoneNumber,
            refId: userData.refId,
            gender: gender ? gender : userData.gender,
            modificationNotes: userData.modificationNotes,
            country: country ? country : userData.country,
            profession: profession ? profession : userData.profession,
            platformLanguage: platformLanguage ? platformLanguage : userData.platformLanguage,
            profilePhoto: profilePhoto ? profilePhoto : userData.profilePhoto,
          };
          this.userService.updateUser(
            userParams,
            async (err: any, updatedUserData: IUser | any) => {
              if (err) {
                CommonService.mongoError(err, res);
              } else {
                updatedUserData
                  .populate('profilePhoto')
                  .then((populatedUserData: any) => {
                    const profilePhoto = populatedUserData.profilePhoto
                      ? populatedUserData.profilePhoto?.image
                      : '';
                    return CommonService.successResponse(
                      'User Profile Updated Successfully',
                      { ...populatedUserData._doc, profilePhoto },
                      res
                    );
                  })
                  .catch((err: any) => {
                    return CommonService.mongoError(err, res);
                  });
              }
            }
          );
        } else {
          CommonService.failureResponse('invalid user', null, res);
        }
      });
    } else {
      CommonService.insufficientParameters(res);
    }
  }
  public updateUserPassword(req: Request | any, res: Response) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (currentPassword && newPassword && confirmPassword) {
      const userFilter = { _id: req.params.id };
      this.userService.filterUser(
        userFilter,
        (err: any, userData: IUser) => {
          if (err) {
            CommonService.mongoError(err, res);
          } else if (userData) {
            const hashedPassword = cryptoJs.AES.decrypt(
              userData.password,
              process.env.CRYPTO_JS_PASS_SEC
            );
            if (hashedPassword.toString(cryptoJs.enc.Utf8) === currentPassword) {
              if (newPassword === confirmPassword) {
                userData.password = cryptoJs.AES.encrypt(
                  newPassword,
                  process.env.CRYPTO_JS_PASS_SEC
                ).toString();
                userData.modificationNotes.push({
                  modifiedOn: new Date(),
                  modifiedBy: req.user.id,
                  modificationNote: 'User password updated',
                });

                this.userService.updateUser(userData, (err: any, updatedUserData: IUser) => {
                  if (err) {
                    return CommonService.mongoError(err, res);
                  } else {
                    const mailParams: IConfirmPasswordUpdate = {
                      name: updatedUserData?.name.firstName + ' ' + updatedUserData?.name.lastName,
                      email: updatedUserData?.email,
                    };
                    this.mailService
                      .PasswordUpdateNotification(mailParams)
                      .then((result) => {
                        return CommonService.successResponse(
                          'User password updated successfully',
                          { id: updatedUserData._id },
                          res
                        );
                      })
                      .catch((err) => {
                        return CommonService.failureResponse('Mailer Service error', err, res);
                      });
                  }
                });
              } else {
                CommonService.failureResponse('Passwords do not match', null, res);
              }
            } else {
              return CommonService.failureResponse('Invalid current password provided', null, res);
            }
          } else {
            return CommonService.failureResponse('invalid user', null, res);
          }
        },
        true
      );
    } else {
      // error response if some fields are missing in request body
      return CommonService.insufficientParameters(res);
    }
  }

  public deleteUser(req: Request, res: Response) {
    if (req.params.id) {
      this.userService.deleteUser(req.params.id, (err: any, delete_details) => {
        if (err) {
          CommonService.mongoError(err, res);
        } else if (delete_details.deletedCount !== 0) {
          CommonService.successResponse('delete user successfull', null, res);
        } else {
          CommonService.failureResponse('invalid user', null, res);
        }
      });
    } else {
      CommonService.insufficientParameters(res);
    }
  }
}
