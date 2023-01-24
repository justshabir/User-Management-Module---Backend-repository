import { ModificationNote } from '../common/model';

interface DocumentResult {
  _doc?: any;
}
export interface IOrganizations extends DocumentResult {
  _id?: string;
  businessName?: string;
  businessSize?: number;
  businessEmail?: string;
  businessPhoneNumber?: string;
  businessOwner?: string;
  country?: string;
  language?: string;
  industry?: string;
  isDeleted?: boolean;
  status?: string;
  businessLogo?: string;
  members?: string[];
  modificationNotes: ModificationNote[];
}
