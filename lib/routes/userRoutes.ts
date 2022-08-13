import { Application, Request, Response } from 'express';
import AuthMiddleWare from '../middlewares/auth';
import { UserController } from '../controllers/userController';

export class UserRoutes {
  private userController: UserController = new UserController();
  public route(app: Application) {
    app.get(
      '/api/user/:id',
      AuthMiddleWare.verifyTokenAndAuthorization,
      (req: Request, res: Response) => {
        this.userController.getUser(req, res);
      }
    );
    app.put(
      '/api/user/:id/password-update',
      AuthMiddleWare.verifyToken,
      (req: Request, res: Response) => {
        this.userController.updateUserPassword(req, res);
      }
    );
    app.put('/api/user/:id', AuthMiddleWare.verifyToken, (req: Request, res: Response) => {
      this.userController.updateUser(req, res);
    });

    app.delete(
      '/api/user/:id',
      AuthMiddleWare.verifyTokenAndAuthorization,
      (req: Request, res: Response) => {
        this.userController.deleteUser(req, res);
      }
    );
  }
}
