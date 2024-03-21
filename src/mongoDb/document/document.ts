import { Document, Schema } from 'mongoose';
export type Documents = {
  name?: string;
  date?: number;
  key?: string;
};
export default interface EldDocument extends Document {
  vendor: string;
  deviceName: string;
  serialNo: string;
  notes?: string;
  eldNo: string;
  documents?: Documents[];
  deviceType?: string;
  deviceVersion?: string;
  tenantId?: string;
  softwareVersion?: string;
  isActive: boolean;
  isDeleted?: boolean;
  deviceToken?: string;
}
