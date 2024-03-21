import { EldResponse } from '../models/response.model';
import { EldRequest } from '../models/request.model';
import { EditRequest } from '../models/editRequest.model';
import { AppService } from '../app.service';
import { NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { uploadDocument } from './uploadDocument';

export const addAndUpdate = async (
  deviceService: AppService,
  requestModel: EldRequest | EditRequest,
  option: any = {},
): Promise<EldRequest | EditRequest> => {
  try {
    const device = await deviceService.findOne(option);
    if (device && Object.keys(device).length > 0) {
      throw new ConflictException(`ELD number already exists`);
    } else {
      return requestModel;
    }
  } catch (err) {
    throw err;
  }
};
