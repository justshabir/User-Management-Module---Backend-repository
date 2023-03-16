import { Application, Request, Response } from 'express';
import AuthMiddleWare from '../middlewares/auth';
import { UserController } from '../controllers/userController';
import { ReferralController } from '../controllers/referralController';
import { UserPermissionsController } from '../controllers/userPermissionsController';
import ValidatorMiddleware from '../middlewares/validator';
import userValidatorSchema from '../modules/users/validator';

export class UserRoutes {
  private userController: UserController = new UserController();
  private referralController: ReferralController = new ReferralController();
  private userPermissionsController: UserPermissionsController = new UserPermissionsController();
  public route(app: Application) {
    app.patch(
      '/api/users/reset-password',
      ValidatorMiddleware(userValidatorSchema.resetPassword, 'body'),
      (req: Request, res: Response) => {
        this.userController.resetPassword(req, res);
      }
    );
    app.patch(
      '/api/users/:id/password-update',
      AuthMiddleWare.verifyToken,
      (req: Request, res: Response) => {
        this.userController.updateUserPassword(req, res);
      }
    );

    app.post(
      '/api/users/forgot-password',
      ValidatorMiddleware(userValidatorSchema.verifyEmail, 'body'),
      (req: Request, res: Response) => {
        this.userController.forgotPassword(req, res);
      }
    );

    app.get(
      '/api/users/:id/permission',
      ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
      AuthMiddleWare.verifyTokenAndAuthorization,
      (req: Request, res: Response) => {
        this.userPermissionsController.getUserPermissions(req, res);
      }
    );

    app.patch(
      '/api/users/:id/permission',
      ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
      AuthMiddleWare.verifyTokenAndAuthorization,
      (req: Request, res: Response) => {
        this.userPermissionsController.updateUserPermissions(req, res);
      }
    );
    app
      .route('/api/users/:id')
      .get(
        ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
        AuthMiddleWare.verifyTokenAndAuthorization,
        (req: Request, res: Response) => {
          this.userController.getUser(req, res);
        }
      )
      .patch(
        ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
        AuthMiddleWare.verifyToken,
        (req: Request, res: Response) => {
          this.userController.updateUser(req, res);
        }
      )
      .delete(
        ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
        AuthMiddleWare.verifyTokenAndAuthorization,
        (req: Request, res: Response) => {
          this.userController.deleteUser(req, res);
        }
      );

    app.get(
      '/api/users/:id/referral-code',
      ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
      (req: Request, res: Response) => {
        this.referralController.getReferralId(req, res);
      }
    );
    app.post(
      '/api/users/:id/invite',
      ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
      ValidatorMiddleware(userValidatorSchema.verifyReferral, 'body'),
      (req: Request, res: Response) => {
        this.referralController.sendReferral(req, res);
      }
    );
  }
}
