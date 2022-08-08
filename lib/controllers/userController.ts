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
          successResponse('get user successfully', userData, res);
        }
      });
    } else {
      insufficientParameters(res);
    }
  }

  public update_user(req: Request, res: Response) {
    const { email, last_name, first_name, phone_number = '', gender = '', isDeleted } = req.body;
    if (
      (req.params.id && (first_name || last_name)) ||
      last_name ||
      first_name ||
      email ||
      phone_number ||
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
              first_name || last_name
                ? {
                  first_name: first_name ? first_name : userData.name.firstName,
                  last_name: first_name ? last_name : userData.name.lastName,
                }
                : userData.name,
            email: email ? email : userData.email,
            phone_number: phone_number ? phone_number : userData.phoneNumber,
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
  public deleteUserr(req: Request, res: Response) {
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
