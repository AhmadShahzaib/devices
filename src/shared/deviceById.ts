import { AppService } from '../app.service';
import { EldResponse } from '../models';
import { NotFoundException, Logger } from '@nestjs/common';
import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import EldDocument from 'mongoDb/document/document';
export const deviceById = async (
  deviceService: AppService,
  id: string,

  option: any = {},
): Promise<EldResponse | Error> => {
  try {
    let device = null;
    if (!!id) {
      device = await deviceService.findEldById(id, option);
      Logger.log(`Device with id: ${id} was found`);
    } else {
      Logger.debug(`Device against id: ${id} not found`);
    }
    if (device && Object.keys(device).length > 0) {
      const resultData: EldResponse = new EldResponse(device);
      if (resultData) {
        return resultData;
      }
    } else {
      Logger.log(`Device not Found with Id:${id}`);
      throw new NotFoundException('Device not found');
    }
  } catch (err) {
    throw err;
  }
};
