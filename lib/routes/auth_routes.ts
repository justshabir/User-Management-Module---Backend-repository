import { Application, NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import AuthententicationMiddleWare from '../middlewares/auth';

export class AuthRoutes {
  private authController: AuthController = new AuthController();

  public route(app: Application) {
    app.post('/api/auth/local/register', (req: Request, res: Response) => {
      this.authController.create_user(req, res);
    });
    app.post('/api/auth/local/signin', (req: Request, res: Response, next: NextFunction) => {
      this.authController.login_user(req, res, next);
    });
    app.get('/api/auth/confirm/:confirmationCode', (req: Request, res: Response) => {
      this.authController.activate_account(req, res);
    });
    app.get('/api/auth/linkedin', this.authController.linked_in());
    app.get('/api/auth/linkedin/callback', (req: Request, res: Response, next: NextFunction) => {
      this.authController.linked_in_callback(req, res, next);
    });
    app.get('/api/auth/google', this.authController.google());
    app.get('/api/auth/google/callback', (req: Request, res: Response, next: NextFunction) => {
      this.authController.google_callback(req, res, next);
    });
    app.get('/api/auth/microsoft', this.authController.microsoft());
    app.get('/api/auth/microsoft/callback', (req: Request, res: Response, next: NextFunction) => {
      this.authController.microsoft_callback(req, res, next);
    });
    app.get('/api/auth/login/success', (req: Request, res: Response, next: NextFunction) => {
      this.authController.login_success(req, res);
    });
    app.get(
      '/api/auth/logout',
      AuthententicationMiddleWare.verifyToken,
      (req: Request, res: Response) => {
        this.authController.logout_user(req, res);
      }
    );
  }
}
