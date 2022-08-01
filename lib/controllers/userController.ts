import { Request, Response } from 'express';
import cryptoJs from 'crypto-js';
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
          successResponse('get user successfully', user_data, res);
        }
      });
    } else {
      insufficientParameters(res);
    }
  }

  public update_user(req: Request, res: Response) {
    const { email, last_name, first_name, phone_number = '', gender = '', profession = '', country, platFormLanguage = '', is_deleted, } = req.body;
    if (
      (req.params.id && (first_name || last_name)) ||
      last_name ||
      first_name ||
      email ||
      phone_number ||
      gender ||
      profession ||
      country ||
      platFormLanguage
    ) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
        if (err) {
          mongoError(err, res);
        } else if (user_data) {
          user_data.modification_notes.push({
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
            is_deleted: is_deleted ? is_deleted : user_data.is_deleted,
            profession: profession ? profession : user_data.profession,
            country: country ? country : user_data.country,
            platFormLanguage: platFormLanguage ? platFormLanguage : user_data.platFormLanguage,
            modification_notes: user_data.modification_notes,
          };
          this.user_service.updateUser(user_params, (err: any) => {
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

  public update_user_password(req: Request, res: Response) {
    const { current_password, new_password, confirm_password } = req.body;

    if (current_password && new_password && confirm_password) {
      const user_filter = { _id: req.params.id };
      this.user_service.filterUser(user_filter, (err: any, user_data: IUser) => {
        if (err) {
          mongoError(err, res);
        } else if (user_data) {
          if (user_data.password === cryptoJs.SHA256(current_password).toString()) {
            if (new_password === confirm_password) {
              user_data.password = cryptoJs.SHA256(new_password).toString();
              user_data.modification_notes.push({
                modified_on: new Date(Date.now()),
                modified_by: null,
                modification_note: 'User password updated',
              });
              this.user_service.updateUser(user_data, (err: any) => {
                if (err) {
                  mongoError(err, res);
                } else {
                  successResponse('update user successfully', null, res);
                }
              });
            } else {
              failureResponse('new password and confirm password does not match', null, res);
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

  public delete_user(req: Request, res: Response) {
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
