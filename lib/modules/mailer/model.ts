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
