import { Request, Response } from 'express';
import {
  insufficientParameters,
  mongoError,
  successResponse,
  failureResponse,
} from '../modules/common/service';
import { IUser } from '../modules/users/model';
import UserService from '../modules/users/service';
export class UserController {
  private user_service: UserService = new UserService();

  public getUser(req: Request, res: Response) {
    if (req.params.id) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, userData: IUser) => {
        if (err) {
          mongoError(err, res);
        } else {
          successResponse('get user successfull', userData, res);
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
              successResponse('update user successfull', null, res);
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
  public deleteUserr(req: Request, res: Response) {
    if (req.params.id) {
      this.user_service.deleteUser(req.params.id, (err: any, delete_details) => {
        if (err) {
          mongoError(err, res);
        } else if (delete_details.deletedCount !== 0) {
          successResponse('delete user successfull', null, res);
        } else {
          failureResponse('invalid user', null, res);
        }
      });
    } else {
      insufficientParameters(res);
    }
  }
}
