import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { IConfirmPasswordUpdate } from './model';
import { CONFIRM_PASSWORD_UPDATE_SUBJECT } from '../../utils/constant';
import confirmPasswordUpdate from '../../templates/confirmPasswordUpdate';

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
}
