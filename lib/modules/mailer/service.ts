import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import {
  IConfirmationMail,
  IConfirmPasswordUpdate,
  IForgotPassword,
  ISendReferral,
  IRequestSupport,
} from './model';
import {
  CONFIRM_ACCOUNT_SUBJECT,
  CONFIRM_PASSWORD_UPDATE_SUBJECT,
  PASSWORD_RESET_LINK,
} from '../../utils/constant';
import confirmPasswordUpdate from '../../templates/confirmPasswordUpdate';
import forgotPassword from '../../templates/forgotPassword';
import { ClientBaseUrl } from '../../config/app';
import confirmAccount from '../../templates/confirmAccount';
import referAFriend from '../../templates/referAFriend';
import requestTechnicalSupport from '../../templates/requestTechnicalSupport';
import technicalSupportReceived from '../../templates/technicalSupportReceived';

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

  public async sendAccountActivationRequest(params: IConfirmationMail) {
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
          if (error) throw new Error(error?.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error?.toString());
    }
  }

  public async PasswordUpdateNotification(params: IConfirmPasswordUpdate) {
    const html = confirmPasswordUpdate(params.name);
    try {
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: CONFIRM_PASSWORD_UPDATE_SUBJECT,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error?.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error?.toString());
    }
  }

  public async sendPasswordReset(params: IForgotPassword) {
    try {
      const html = forgotPassword(params.token, this.client_base_url, params.name);
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: PASSWORD_RESET_LINK,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
  public async sendTechnicalSupportConfirmation(params: IRequestSupport) {
    try {
      const html = technicalSupportReceived(
        params.ticketId,
        this.client_base_url,
        params.name,
        params.subject
      );
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: params.subject,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  public async requestTechnicalSupport(params: IRequestSupport) {
    try {
      const html = requestTechnicalSupport(
        params.ticketId,
        params.name,
        params.subject,
      );
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: this.user,
          subject: params.subject,
          html: html,
          ...(params.file && {attachments: [
            {
              filename: params.file?.originalname,
              path:params.file?.location,
            },
          ]})
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  public async sendReferral(params: ISendReferral) {
    try {
      const html = referAFriend(
        params.refId,
        this.client_base_url,
        params.firstName,
        params.lastName
      );
      await this.transporter.verify();
      this.transporter.sendMail(
        {
          from: this.user,
          to: params.email,
          subject: `${params.firstName} ${params.lastName} Wants You to Join!`,
          html: html,
        },
        (error) => {
          if (error) throw new Error(error.toString());
          else return true;
        }
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
