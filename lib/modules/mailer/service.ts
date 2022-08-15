import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { IConfirmationMail, IConfirmPasswordUpdate, IForgotPassword } from './model';
import { CONFIRM_ACCOUNT_SUBJECT, CONFIRM_PASSWORD_UPDATE_SUBJECT, PASSWORD_RESET_LINK } from '../../utils/constant';
import confirmPasswordUpdate from '../../templates/confirmPasswordUpdate';
import forgotPassword from '../../templates/forgotPassword';
import { ClientBaseUrl } from '../../config/app';
import confirmAccount from '../../templates/confirmAccount';

dotenv.config();

const transport: Transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_USER_REFRESH_TOKEN,
  },
});

export default class MailerService {
  private transporter: Transporter = transport;
  private user: string = process.env.GMAIL_USER;

  private client_base_url = ClientBaseUrl;

  public sendAccountActivationRequest(params: IConfirmationMail) {
    return new Promise(async (resolve, reject) => {
      const html = confirmAccount(params.confirmationCode, this.client_base_url, params.name);
      try {
        await this.transporter.verify();
        this.transporter.sendMail(
          {
            from: this.user,
            to: params.email,
            subject: CONFIRM_ACCOUNT_SUBJECT,
            html: html,
          },
          (error) => {
            if (error) reject(error);
            else resolve(true);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public PasswordUpdateNotification(params: IConfirmPasswordUpdate) {
    return new Promise((resolve, reject) => {
      const html = confirmPasswordUpdate(params.name);
      try {
        this.transporter.verify();
        this.transporter.sendMail(
          {
            from: this.user,
            to: params.email,
            subject: CONFIRM_PASSWORD_UPDATE_SUBJECT,
            html: html,
          },
          (error) => {
            if (error) reject(error);
            else resolve(true);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public sendPasswordReset(params: IForgotPassword) {
    return new Promise((resolve, reject) => {
      try {
        const html = forgotPassword(params.token, this.client_base_url, params.name);
        this.transporter.verify();
        this.transporter.sendMail(
          {
            from: this.user,
            to: params.email,
            subject: PASSWORD_RESET_LINK,
            html: html,
          },
          (error) => {
            if (error) reject(error);
            else resolve(true);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}
