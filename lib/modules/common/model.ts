export interface ModificationNote {
  modified_on: Date;
  modified_by: string | null;
  modification_note: string;
}

export const ModificationNote = {
  modified_on: Date,
  modified_by: String,
  modification_note: String,
};

export enum response_status_codes {
  success = 200,
  created = 201,
  no_content = 204,
  modified = 304,
  bad_request = 400,
  unauthorized = 401,
  forbidden = 403,
  internal_server_error = 500,
  not_implemented = 501,
}
