import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Documents } from 'mongoDb/document/document';
import { Schema } from 'mongoose';
import { DeviceTypes } from './enums/deviceType.enum';
export class EldRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
  vendor: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  deviceDocument?: Express.Multer.File[];
  
  documents?: Documents[] = [];

  @ApiProperty()
  @IsString()
  @IsOptional()
  serialNo: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  notes: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @ApiProperty({
    enum: DeviceTypes
  })
  @IsString()
  @IsEnum(DeviceTypes)
  @IsNotEmpty()
  @IsOptional()
  deviceType: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  eldNo: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  deviceVersion: string;

  tenantId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  softwareVersion: string;

}
