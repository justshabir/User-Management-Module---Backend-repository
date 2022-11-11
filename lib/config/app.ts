import express from 'express';
import mongoose from 'mongoose';
import environment from '../environment';
import { UserRoutes } from '../routes/userRoutes';
import { CommonRoutes } from '../routes/commonRoutes';
import { AuthRoutes } from '../routes/authRoutes';
import { UploadRoutes } from '../routes/uploadRoute';
import passport from 'passport';
import expressSession from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import './passport';

dotenv.config();
class App {
  public app: express.Application;
  public mongoUrl =
    process.env.NODE_ENV === 'development'
      ? `mongodb://localhost/${environment.getDBName()}`
      : process.env.MONGO_DB_URI;

  private userRoutes: UserRoutes = new UserRoutes();
  private authRoutes: AuthRoutes = new AuthRoutes();
  private uploadRoutes: UploadRoutes = new UploadRoutes();
  private commonRoutes: CommonRoutes = new CommonRoutes();
  private whitelist: string[] =
    process.env.NODE_ENV !== 'development'
      ? process.env.PROD_CLIENT_BASE_URL.split(',')
      : ['http://localhost:3000'];

  constructor() {
    this.app = express();
    this.config();
    this.mongoSetup();
    this.authRoutes.route(this.app);
    this.userRoutes.route(this.app);
    this.uploadRoutes.route(this.app);
    this.commonRoutes.route(this.app);
  }
  private config(): void {
    this.app.use(
      cors({
        origin: function (origin, callback) {
          if (this.whitelist.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },

        methods: 'GET,POST,PUT,DELETE,PATCH',
        credentials: true,
      })
    );
    this.app.enable('trust proxy');
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      expressSession({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie:
          process.env.NODE_ENV === 'development'
            ? {}
            : { secure: true, httpOnly: false, sameSite: 'none', maxAge: 60 * 60 * 24 * 1000 },
      })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private mongoSetup(): void {
    mongoose
      .connect(this.mongoUrl)
      .then(() => console.log('DB Connection Successful!'))
      .catch((err) => {
        console.log(err);
      });
  }
}
export const PORT = process.env.PORT || environment.getPort();
export const ClientBaseUrl =
  process.env.NODE_ENV !== 'development'
    ? process.env.PROD_CLIENT_BASE_URL
    : 'http://localhost:3000';
export default new App().app;
