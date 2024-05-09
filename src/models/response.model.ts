import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseType } from '@shafiqrathore/logeld-tenantbackend-common-future';
import EldDocument from 'mongoDb/document/document';
import { Schema } from 'mongoose';
class Doc {
  @ApiProperty()
  id?: string;
  @ApiProperty()
  name?: string;
  @ApiProperty()
  key?: string;
  @ApiProperty()
  date?: number;
  constructor(image: any) {
    this.id = image.id;
    this.name = image.name;
    this.key = image.key;
    this.date = image.date;
  }
}
export class EldResponse extends BaseResponseType {
  @ApiProperty()
  id: string;

  @ApiProperty()
  vendor: string;

  @ApiProperty()
  deviceName: string;

  @ApiProperty()
  eldNo?: string;

  @ApiProperty()
  deviceVersion: string;

  @ApiProperty()
  serialNo: string;

  @ApiProperty()
  deviceType: string;

  @ApiProperty()
  deviceToken: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  tenantId?: Schema.Types.ObjectId;

  @ApiProperty()
  softwareVersion: string;

  @ApiProperty()
  vehicleId: string;

  @ApiProperty()
  eldType: string;

  @ApiProperty()
  connectDate: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ isArray: true, type: Doc })
  documents?: Doc[];

  constructor(eldDocument: EldDocument) {
    super();
    this.id = eldDocument.id;
    this.vendor = eldDocument.vendor;
    this.deviceName = eldDocument.deviceName;
    this.eldNo = eldDocument.eldNo;
    this.deviceVersion = eldDocument.deviceVersion;
    this.deviceType = eldDocument.deviceType;
    this.deviceToken = eldDocument.deviceToken;
    this.softwareVersion = eldDocument.softwareVersion;
    this.connectDate = eldDocument.connectDate;
    this.isActive = eldDocument.isActive;
    this.serialNo = eldDocument.serialNo;
    this.notes = eldDocument.notes;
    this.vehicleId = eldDocument.vehicleId;
    this.eldType = eldDocument.eldType;

    this.documents = eldDocument.documents.map((keys) => new Doc(keys));
  }
}
