import { DeviceTypes } from '../../models/enums/deviceType.enum';
import * as mongoose from 'mongoose';

const Documents = new mongoose.Schema(
  {
    name: { type: String, required: false },
    key: { type: String, required: false },
    date: { type: Number, required: false },
  },
  { _id: true },
);
export const EldSchema = new mongoose.Schema(
  {
    serialNo: { type: String, required: false},
    vendor: { type: String, required: false, },
    eldNo: { type: String, index: true },
    deviceType: {
      type: String,
      enum: DeviceTypes,
      default: 'ELD',
    },
    documents: { type: [Documents], required: false },
    deviceName: { type: String, required: true, index: true },
    deviceVersion: { type: String },
    softwareVersion: { type: String },
    notes: { type: String },
    tenantId: { type: mongoose.Schema.Types.ObjectId },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    deviceToken: { type: String },
  },
  { timestamps: true },
);
