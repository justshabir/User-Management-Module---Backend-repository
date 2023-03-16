export interface IChangePassword {
  name: string;
  email: string;
}
export interface IConfirmPasswordUpdate {
  name: string;
  email: string;
}

export interface IConfirmationMail {
  name: string;
  email: string;
  confirmationCode: string;
}

export interface IForgotPassword {
  name: string;
  email: string;
  token: string;
}

export interface IRequestSupport {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message?: string;
  file?: any;
}

export interface ISendReferral {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  refId: string;
}
