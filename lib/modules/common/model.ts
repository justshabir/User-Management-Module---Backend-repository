export interface ModificationNote {
  modifiedOn: Date;
  modifiedBy: string | null;
  modificationNote: string;
}

export const ModificationNote = {
  modifiedOn: Date,
  modifiedBy: String,
  modificationNote: String,
};

export enum responseStatusCodes {
  success = 200,
  created = 201,
  no_content = 204,
  modified = 304,
  bad_request = 400,
  unauthorized = 401,
  forbidden = 403,
  unprocessable = 422,
  internal_server_error = 500,
  not_implemented = 501,
}
