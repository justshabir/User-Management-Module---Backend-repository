import { Application, NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import AuthententicationMiddleWare from '../middlewares/auth';

export class AuthRoutes {
  private authController: AuthController = new AuthController();

  public route(app: Application) {
    app.post('/api/auth/local/register', (req: Request, res: Response) => {
      this.authController.createUser(req, res);
    });
    app.post('/api/auth/local/signin', (req: Request, res: Response, next: NextFunction) => {
      this.authController.loginUser(req, res, next);
    });
    app.get('/api/auth/confirm/:confirmationCode', (req: Request, res: Response) => {
      this.authController.activateAccount(req, res);
    });
    app.get('/api/auth/linkedin', this.authController.linked_in());
    app.get('/api/auth/linkedin/callback', (req: Request, res: Response, next: NextFunction) => {
      this.authController.linkedInCallback(req, res, next);
    });
    app.get('/api/auth/google', this.authController.google());
    app.get('/api/auth/google/callback', (req: Request, res: Response, next: NextFunction) => {
      this.authController.googleCallback(req, res, next);
    });
    app.get('/api/auth/microsoft', this.authController.microsoft());
    app.get('/api/auth/microsoft/callback', (req: Request, res: Response, next: NextFunction) => {
      this.authController.microsoftCallback(req, res, next);
    });
    app.get('/api/auth/login/success', (req: Request, res: Response, next: NextFunction) => {
      this.authController.loginSuccess(req, res);
    });
    app.get(
      '/api/auth/logout',
      AuthententicationMiddleWare.verifyToken,
      (req: Request, res: Response) => {
        this.authController.logOutUser(req, res);
      }
    );
  }
}
