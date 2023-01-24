import { OrgController } from '../controllers/orgController';
import { Application, NextFunction, Request, Response } from 'express';
import orgValidatorSchema from '../modules/organizations/validator';
import ValidatorMiddleware from '../middlewares/validator';

export class OrgRoutes {
  private orgController: OrgController = new OrgController();

  public route(app: Application) {
    app.post(
      '/api/organizations/register',
      ValidatorMiddleware(orgValidatorSchema.register, 'body'),
      (req: Request, res: Response) => {
        this.orgController.register(req, res);
      }
    );
  }
}
