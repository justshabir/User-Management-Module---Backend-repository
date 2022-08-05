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

export enum response_status_codes {
  success = 200,
  created = 201,
  noContent = 204,
  modified = 304,
  bad_request = 400,
  unauthorized = 401,
  forbidden = 403,
  iinternalServerError = 500,
  notImplemented = 501,
}
