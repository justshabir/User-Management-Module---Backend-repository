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

  public get_user(req: Request, res: Response) {
    if (req.params.id) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
        if (err) {
          mongoError(err, res);
        } else {
          successResponse('get user successfull', user_data, res);
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
      this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
        if (err) {
          mongoError(err, res);
        } else if (user_data) {
          user_data.modificationNotes.push({
            modified_on: new Date(Date.now()),
            modified_by: null,
            modification_note: 'User data updated',
          });
          const user_params: IUser = {
            _id: req.params.id,
            name:
              first_name || last_name
                ? {
                    first_name: first_name ? first_name : user_data.name.first_name,
                    last_name: first_name ? last_name : user_data.name.last_name,
                  }
                : user_data.name,
            email: email ? email : user_data.email,
            phone_number: phone_number ? phone_number : user_data.phone_number,
            gender: gender ? gender : user_data.gender,
            isDeleted: isDeleted ? isDeleted : user_data.isDeleted,
            modificationNotes: user_data.modificationNotes,
          };
          this.user_service.updateUser(user_params, (err: any) => {
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
  public delete_user(req: Request, res: Response) {
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
