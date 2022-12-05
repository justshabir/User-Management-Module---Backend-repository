import { Application, Request, Response } from 'express';
import AuthMiddleWare from '../middlewares/auth';
import { UserController } from '../controllers/userController';
import { UserPermissionsController } from '../controllers/userPermissionsController';
import ValidatorMiddleware from '../middlewares/validator';
import userValidatorSchema from '../modules/users/validator';

export class UserRoutes {
  private userController: UserController = new UserController();
  private userPermissionsController: UserPermissionsController = new UserPermissionsController();
  public route(app: Application) {
    app
      .route('/api/user/:id')
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
          console.log('req', req.user);

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

    app.patch(
      '/api/user/:id/password-update',
      AuthMiddleWare.verifyToken,
      (req: Request, res: Response) => {
        this.userController.updateUserPassword(req, res);
      }
    );

    app.post(
      '/api/user/forgot-password',
      ValidatorMiddleware(userValidatorSchema.verifyEmail, 'body'),
      (req: Request, res: Response) => {
        this.userController.forgotPassword(req, res);
      }
    );

    app.patch(
      '/api/user/reset-password',
      ValidatorMiddleware(userValidatorSchema.resetPassword, 'body'),
      (req: Request, res: Response) => {
        this.userController.resetPassword(req, res);
      }
    );

    app.get(
      '/api/user/:id/permission',
      ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
      AuthMiddleWare.verifyTokenAndAuthorization,
      (req: Request, res: Response) => {
        this.userPermissionsController.getUserPermissions(req, res);
      }
    );

    app.patch(
      '/api/user/:id/permission',
      ValidatorMiddleware(userValidatorSchema.verifyParamsId, 'params'),
      AuthMiddleWare.verifyTokenAndAuthorization,
      (req: Request, res: Response) => {
        this.userPermissionsController.updateUserPermissions(req, res);
      }
    );
  }
}
