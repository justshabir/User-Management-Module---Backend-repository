import { Application, Request, Response } from 'express';
import { UserController } from '../controllers/userController';

export class UserRoutes {
  private userController: UserController = new UserController();
  public route(app: Application) {
    app.get('/api/user/:id', (req: Request, res: Response) => {
      this.userController.getUser(req, res);
    });

    app.put('/api/user/:id', (req: Request, res: Response) => {
      this.userController.updateUser(req, res);
    });

    app.put('/api/user/:id/passwordupdate', (req: Request, res: Response) => {
      this.user_controller.update_user_password(req, res);
    });

    app.delete('/api/user/:id', (req: Request, res: Response) => {
      this.userController.deleteUserr(req, res);
    });
  }
}
