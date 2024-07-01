import { Model, Schema, FilterQuery, ProjectionType } from 'mongoose';
import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  BaseService,
  mapMessagePatternResponseToException,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { InjectModel } from '@nestjs/mongoose';
import { EldRequest, EditRequest } from './models';
import EldDocument from './mongoDb/document/document';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { EldResponse } from './models';

@Injectable()
export class AppService extends BaseService<EldDocument> {
  protected _model: Model<EldDocument>;
  private readonly logger = new Logger('EldService');
  constructor(
    @InjectModel('Eld')
    private readonly eldModel: Model<EldDocument>,
    @Inject('UNIT_SERVICE') private readonly unitClient: ClientProxy,
    @Inject('VEHICLE_SERVICE') private readonly vehicleClient: ClientProxy,
  ) {
    super();
    this._model = eldModel;
  }
  addEld = async (eld: EldRequest, tenantId: string): Promise<EldDocument> => {
    try {
      Logger.debug(eld);
      eld.tenantId = tenantId;
      return await this.eldModel.create(eld);
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  updateEldIdInVehicle = async (
    vehicleId: string,
    tenantId: string,
    eldId: string,
    deviceName: string,
  ): Promise<string[]> => {
    try {
      const resp = await firstValueFrom(
        this.vehicleClient.send(
          { cmd: 'update_eldId_in_vehicle' },
          { vehicleId, tenantId, eldId, deviceName },
        ),
      );
      if (resp.isError) {
        mapMessagePatternResponseToException(resp);
      }
      return resp.data;
    } catch (err) {
      Logger.log(err);
      throw err;
    }
  };
  deviceByNo = async (option: any) => {
    try {
      let response;
      console.log(`options ---------------- `, option);

      const eld = await this.eldModel.findOne(option);
      console.log(`eld foind =============== `, eld);

      if (eld) {
        return (response = {
          statusCode: 200,
          message: 'Device token and type fetched successfully!',
          data: {
            deviceToken: eld.deviceToken,
            deviceType: eld.deviceType,
          },
        });
      }
      return (response = {
        statusCode: 200,
        message: 'Device token and type fetch failed!',
        data: {},
      });
    } catch (err) {
      throw err;
    }
  };

  updateDeviceTokenAndType = async (options) => {
    const eld = await this.eldModel.findOne({ _id: options.eldId });
    if (eld) {
      eld.deviceType = options.deviceType;
      eld.deviceToken = options.deviceToken;
      await eld.save();
      return {
        statusCode: 200,
        message: 'Eld updated successfully!',
        data: eld,
      };
    }
    return {
      statusCode: 200,
      message: 'Eld update failed!',
      data: {},
    };
  };

  getAssignedDevices = async (key: string): Promise<string[]> => {
    try {
      const resp = await firstValueFrom(
        this.vehicleClient.send({ cmd: 'get_all_assigned_devices' }, key),
      );
      if (resp.isError) {
        mapMessagePatternResponseToException(resp);
      }
      return resp.data;
    } catch (err) {
      Logger.log(err);
      throw err;
    }
    // try {
    //   const resp = await firstValueFrom(
    //     this.vehicleClient.send({ cmd: 'get_all_vehicle' }, {}),
    //   );
    //   if (resp.isError) {
    //     mapMessagePatternResponseToException(resp);
    //   }
    //   return resp.data;
    // } catch (err) {
    //   Logger.log(err);
    //   throw err;
    // }
  };
  updateEld = async (id: string, eld: EditRequest): Promise<EldDocument> => {
    try {
      return await this.eldModel.findByIdAndUpdate(id, eld, {
        new: true,
      });
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  count = (options) => {
    try {
      return this.eldModel
        .count(options)
        .and([{ isDeleted: false }])
        .exec();
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  eldStatus = async (id: string, status: boolean): Promise<EldDocument> => {
    try {
      return await this.eldModel.findByIdAndUpdate(
        id,
        { isActive: status },
        {
          new: true,
        },
      );
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  eldConnect = async (
    id: string,
    status: boolean,
    serialNo: string,
    vehicleId: string,
    deviceType: string,
  ): Promise<EldDocument> => {
    try {
      return await this.eldModel.findByIdAndUpdate(
        id,
        { connectDate: status, serialNo, vehicleId, deviceType },
        {
          new: true,
        },
      );
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  findEldById = async (id: string, option: any = {}): Promise<EldDocument> => {
    try {
      const res = await this.eldModel
        .findById(id)
        .and([{ isDeleted: false }, option]);
      return res;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  find = (options) => {
    try {
      const query = this.eldModel.find(options);
      query.and([{ isDeleted: false }]);
      return query;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  deleteOne = async (id: string) => {
    try {
      return await this.eldModel.findByIdAndUpdate(id, { isDeleted: true });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };
  addDeviceAssigned = async (device: EldResponse, tenantId: string) => {
    try {
      const { id, eldNo, serialNo, vendor } = device;
      const resp = await firstValueFrom(
        this.unitClient.emit(
          { cmd: 'device_added' },
          { id, eldNo, serialNo, vendor, tenantId },
        ),
      );
      return resp;
    } catch (error) {
      Logger.error({ error });
      throw error;
    }
  };

  isDeviceAssignedVehicle = async (id: string): Promise<boolean> => {
    try {
      // const resp = await firstValueFrom(
      //   this.unitClient.send({ cmd: 'is_device_assigned' }, { deviceId: id }),
      // );
      const resp = await firstValueFrom(
        this.vehicleClient.send({ cmd: 'is_device_assigned_in_Vehicle' }, id),
      );
      if (resp.isError) {
        mapMessagePatternResponseToException(resp);
      }
      return resp.data;
    } catch (err) {
      Logger.log(err);
      throw err;
    }
  };
  getEldPattern = async (id: string): Promise<EldDocument> => {
    try {
      return await this.eldModel.findById(id);
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  findOne = async (options: FilterQuery<EldDocument>): Promise<EldDocument> => {
    try {
      return await this.eldModel.findOne(options);
    } catch (err) {
      this.logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  };

  updateStatusInUnitService = async (id, status) => {
    try {
      return await firstValueFrom(
        this.unitClient.emit(
          { cmd: 'change_device_status' },
          { deviceId: id, isActive: status },
        ),
      );
    } catch (error) {
      this.logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  };

  populateVehicle = async (id: string, option: any = {}) => {
    try {
      const resp = await firstValueFrom(
        this.vehicleClient.send(
          { cmd: 'get_assigned_vehicle_by_deviceId' },
          id,
        ),
      );
      return resp;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      Logger.log({ id });
      throw err;
    }
  };

  // addDeviceToUnit = async (id) => {
  //   try {
  //     return this.unitClient.emit({ cmd: 'device_added' }, { deviceId: id });
  //   } catch (error) {
  //     this.logger.error({ message: error.message, stack: error.stack });
  //     throw error;
  //   }
  // };
}
