export interface ITechnicalSupport {
  _id: string;
  email: string;
  subject: string;
  message: string;
  file: {
    key: string;
    location: string;
  };
  receivedAt?: Date;
  resolved?: boolean;
  resolvedAt?: Date;
}

export interface IUpdateTechnicalSupport {
  resolved?: boolean;
  resolvedAt?: Date;
}

export interface IPage {
  skip: number;
  limit: number;
}
