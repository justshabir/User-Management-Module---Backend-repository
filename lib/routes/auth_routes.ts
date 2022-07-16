import { Application, NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import AuthententicationMiddleWare from '../middlewares/auth';

export class AuthRoutes {
  private auth_controller: AuthController = new AuthController();

  public route(app: Application) {
    app.post('/api/auth/local/register', (req: Request, res: Response) => {
      this.auth_controller.create_user(req, res);
    });
    app.post('/api/auth/local/signin', (req: Request, res: Response, next: NextFunction) => {
      this.auth_controller.login_user(req, res, next);
    });
    app.get('/api/auth/confirm/:confirmationCode', (req: Request, res: Response) => {
      this.auth_controller.activate_account(req, res);
    });
    app.get('/api/auth/linkedin', this.auth_controller.linked_in());
    app.get('/api/auth/linkedin/callback', (req: Request, res: Response, next: NextFunction) => {
      this.auth_controller.linked_in_callback(req, res, next);
    });
    app.get('/api/auth/google', this.auth_controller.google());
    app.get('/api/auth/google/callback', (req: Request, res: Response, next: NextFunction) => {
      this.auth_controller.google_callback(req, res, next);
    });
    app.get('/api/auth/login/success', (req: Request, res: Response, next: NextFunction) => {
      this.auth_controller.login_success(req, res);
    });
    app.get(
      '/api/auth/logout',
      AuthententicationMiddleWare.verifyToken,
      (req: Request, res: Response) => {
        this.auth_controller.logout_user(req, res);
      }
    );
  }
}
