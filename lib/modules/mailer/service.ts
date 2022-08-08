import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { IChangePassword } from './model';
import { CONFIRM_ACCOUNT_SUBJECT, PASSWORD_RESET_HELP } from '../../utils/constants';
import confirm_account from '../../templates/confirm_account';
import { ClientBaseUrl } from '../../config/app';
import forgot_password from '../../templates/forgot_password';

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
      const html = confirm_account(params.confirmationCode, this.client_base_url, params.name);
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
  public sendPasswordReset(params: IForgotPassword) {
    return new Promise(async (resolve, reject) => {
      const html = forgot_password(params.token, this.client_base_url, params.name);
      try {
        await this.transporter.verify();
        this.transporter.sendMail(
          {
            from: this.user,
            to: params.email,
            subject: PASSWORD_RESET_HELP,
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
