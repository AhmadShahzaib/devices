import { addAndUpdate } from './shared/addAndUpdate.validator';
import {
  Controller,
  Body,
  HttpStatus,
  InternalServerErrorException,
  Query,
  Res,
  HttpException,
  ConflictException,
  Logger,
  Req,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { MessagePattern } from '@nestjs/microservices';
import { deviceById } from './shared/deviceById';
import {
  ListingParams,
  MongoIdValidationPipe,
  MessagePatternResponseInterceptor,
  BaseController,
  ListingParamsValidationPipe,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import {
  searchableAttributes,
  sortableAttributes,
  EldResponse,
  EldRequest,
  EditRequest,
  StatusRequest,
} from './models';
import { AppService } from './app.service';
import AddDecorators from './decorators/add';
import DeleteDecorators from './decorators/delete';
import GetByIdDecorators from './decorators/getById';
import UpdateByIdDecorators from './decorators/updateById';
import GetDecorators from './decorators/get';
import IsActiveDecorators from './decorators/isActive';
import connectedEldDecorators from './decorators/connectedEldDecorators';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import EldDocument from 'mongoDb/document/document';
import { uploadDocument } from 'shared/uploadDocument';
import { isActiveinActive } from 'utils/active';
import { Types } from 'mongoose';

@Controller('ELD')
@ApiTags('ELD')
export class AppController extends BaseController {
  constructor(private readonly eldService: AppService) {
    super();
  }

  @UseInterceptors(new MessagePatternResponseInterceptor())
  @MessagePattern({ cmd: 'get_device_by_id' })
  async tcp_getDeviceById(id: string): Promise<EldResponse | Error> {
    let device;
    let exception;

    try {
      Logger.log(`get DeviceById method call with id:${id}`);

      const option = {};
      // { isActive: true };
      device = await deviceById(this.eldService, id, option);
      return device;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      exception = err;
      return exception;
    }
  }

  @UseInterceptors(MessagePatternResponseInterceptor)
  @MessagePattern({ cmd: 'letIT_device_by_id' })
  async tcp_letDeviceById(id: string): Promise<any | Error> {
    try {
      let device;
      let exception;
      Logger.log(`getDeviceById method call with id:${id}`);

      const option = {};
      // { isActive: true };
      device = await deviceById(this.eldService, id, option);
      return device;
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      return err;
      // return  exception;
    }
  }

  @MessagePattern({ cmd: 'get_device_by_no' })
  // @UseInterceptors(new MessagePatternResponseInterceptor())
  async tcp_getDeviceByNo(eldNo: string): Promise<EldResponse | Error> {
    let device;
    let exception;

    try {
      const option = { isActive: true, _id: eldNo };
      device = await this.eldService.deviceByNo(option);
      console.log(`device --------------------- `, device);
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      exception = err;
    }

    return device ?? exception;
  }

  /**
   * Author Farzan
   * Upate device token and type
   */
  @MessagePattern({ cmd: 'update_device_token_and_type' })
  // @UseInterceptors(new MessagePatternResponseInterceptor())
  async tcp_updateDevice(options) {
    try {
      const response = await this.eldService.updateDeviceTokenAndType(options);
      return response;
    } catch (err) {
      throw err;
    }
  }

  // @------------------- Get Eld API controller -------------------
  @GetDecorators()
  async getEldDevice(
    @Query(ListingParamsValidationPipe) queryParams: ListingParams,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const options = {};
      const { search, orderBy, orderType, limit, showUnAssigned } = queryParams;
      let { pageNo } = queryParams;
      const { tenantId: id } = request.user ?? ({ tenantId: undefined } as any);
      // options['$and'] = [{ tenantId: id }];

      let isActive = queryParams.isActive;
      const arr = [];
      arr.push(isActive);
      if (arr.includes('true')) {
        isActive = true;
      } else {
        isActive = false;
      }

      if (search) {
        options['$or'] = [];
        searchableAttributes.forEach((attribute) => {
          options['$or'].push({ [attribute]: new RegExp(search, 'i') });
        });
        if (arr[0]) {
          options['$and'] = [];
          isActiveinActive.forEach((attribute) => {
            options['$and'].push({ [attribute]: isActive });
          });
        }
      } else {
        if (arr[0]) {
          options['$or'] = [];

          isActiveinActive.forEach((attribute) => {
            options['$or'].push({ [attribute]: isActive });
          });
        }
      }
      if (options.hasOwnProperty('$and')) {
        options['$and'].push({ tenantId: id });
      } else {
        options['$and'] = [{ tenantId: id }];
      }
      try {
        if (showUnAssigned) {
          const assignedVehicle = await this.eldService.getAssignedDevices(
            'eldId',
          );
          Object.assign(options, { _id: { $nin: assignedVehicle } });
        }
      } catch (err) {}
      const query = this.eldService.find(options);

      if (orderBy && sortableAttributes.includes(orderBy)) {
        query.collation({ locale: 'en' }).sort({ [orderBy]: orderType ?? 1 });
      } else {
        query.sort({ createdAt: 1 });
      }
      if (isActive) {
        // options['$and'] = [];

        options['$and'].push({ ['isActive']: isActive });
      }

      const total = await this.eldService.count(options);

      let queryResponse;
      if (!limit || !isNaN(limit)) {
        query.skip(((pageNo ?? 1) - 1) * (limit ?? 10)).limit(limit ?? 10);
      }
      queryResponse = await query.exec();
      const data = [];
      for (const eld of queryResponse) {
        const jsonEld = eld.toJSON();
        const vehicleDetails = await this.eldService.populateVehicle(eld._id);
        if (vehicleDetails?.data) {
          jsonEld.vehicleId = vehicleDetails?.data?.vehicleId || '';
        }
        jsonEld.id = eld?.id;
        data.push(new EldResponse(jsonEld));
        // let eldId = JSON.stringify(eld._doc._id);
        // eldId = JSON.parse(eldId);
        // const foundObject = assignedVehicle.find(
        //   (obj) => obj['eldId'] == eldId,
        // );
        // data.push(new EldResponse(eld));
        // if (foundObject) {
        //   data[index]['vehicleId'] = foundObject['vehicleId'];
        // }
        // index++;
      }
      if (data.length == 0) {
        if (pageNo > 1) {
          pageNo = pageNo - 1;
        }
      }
      return response.status(HttpStatus.OK).send({
        data: data,
        total,
        pageNo: pageNo ?? 1,
        last_page: Math.ceil(
          total /
            (limit && limit.toString().toLowerCase() === 'all'
              ? total
              : limit ?? 10),
        ),
      });
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  // @------------------- Delete Eld API controller -------------------
  @DeleteDecorators()
  async deleteDevice(
    @Param('id', MongoIdValidationPipe) id: string,
    @Res() response: Response,
    @Req() req: Request,
  ) {
    try {
      Logger.log(`deleteDevice was called with params: ${id}`);
      Logger.log(
        `${req.method} request received from ${req.ip} for ${
          req.originalUrl
        }by: ${
          !response.locals.user ? 'Unauthorized User' : response.locals.user.id
        }`,
      );
      const checkAssign: boolean =
        await this.eldService.isDeviceAssignedVehicle(id);
      if (checkAssign) {
        throw new ConflictException(`device ${id} assigned to Vehicle`);
      }
      const device = await this.eldService.deleteOne(id);
      if (device && Object.keys(device).length > 0) {
        Logger.log(`device deleted`);
        return response.status(HttpStatus.OK).send({
          message: 'Device has been deleted successfully',
        });
      } else {
        Logger.log(`device not deleted against id: ${id}`);
        throw new NotFoundException(`${id} Not Found`);
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  @IsActiveDecorators()
  async deviceStatus(
    @Param('id', MongoIdValidationPipe) id: string,
    @Body() requestData: StatusRequest,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      Logger.log(`Device status was called with params: ${id}`);
      Logger.log(
        `${req.method} request received from ${req.ip} for ${
          req.originalUrl
        } by: ${
          !response.locals.user ? 'Unauthorized User' : response.locals.user.id
        }`,
      );
      const { isActive } = requestData;

      const checkAssign: boolean =
        await this.eldService.isDeviceAssignedVehicle(id);
      if (checkAssign) {
        throw new ConflictException(
          `Device is already associated with the Vehicle`,
        );
      }
      const eldStatus = await this.eldService.eldStatus(id, isActive);
      if (eldStatus && Object.keys(eldStatus).length > 0) {
        await this.eldService.updateStatusInUnitService(id, isActive);
        const result: EldResponse = new EldResponse(eldStatus);
        Logger.log(`Device status changed successfully`);
        return response.status(HttpStatus.OK).send({
          message: `ELD is ${
            isActive ? 'activated' : 'deactivated'
          } successfully`,
          data: result,
        });
      } else {
        Logger.log(`Device not Found`);
        throw new NotFoundException(`${id} does not exist`);
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }
  // @------------------- Edit ONE eld connected time API controller -------------------
  @connectedEldDecorators()
  async connectDeviceStatus(
    // @Param('id', MongoIdValidationPipe) id: string,
    @Body() requestData: any,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    try {
      Logger.log(`Device status was called with params: ${requestData.id}`);
      Logger.log(
        `${req.method} request received from ${req.ip} for ${
          req.originalUrl
        } by: ${
          !response.locals.user ? 'Unauthorized User' : response.locals.user.id
        }`,
      );
      let eldStatus;
      const { id, connectDate, serialNo, vehicleId, eldType } = requestData;
      if (id != '') {
        eldStatus = await this.eldService.eldConnect(
          id,
          connectDate,
          serialNo,
          vehicleId,
          eldType,
        );
      } else {
        const { tenantId } = req.user ?? ({ tenantId: undefined } as any);
        eldStatus = await this.eldService.addEld(requestData, tenantId);
        const eldId = eldStatus._doc._id.toString(); // changing from objectID to string
        await this.eldService.updateEldIdInVehicle(vehicleId, eldId);
      }

      if (eldStatus && Object.keys(eldStatus).length > 0) {
        // await this.eldService.updateStatusInUnitService(id, isActive);
        const result: EldResponse = new EldResponse(eldStatus);
        Logger.log(`Device status changed successfully`);
        return response.status(HttpStatus.OK).send({
          message:
            id == ''
              ? 'Device created successfully!'
              : 'Device status has been changed successfully!',
          data: result,
        });
      } else {
        Logger.log(`Device not Found`);
        throw new NotFoundException(`${id} does not exist`);
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }
  // @------------------- Get ONE eld API controller -------------------

  @GetByIdDecorators()
  async getDeviceById(
    @Param('id', MongoIdValidationPipe) id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      Logger.log(`getDeviceById was called with params: ${id}`);
      Logger.log(
        `${req.method} request received from ${req.ip} for ${
          req.originalUrl
        } by: ${!res.locals.user ? 'Unauthorized User' : res.locals.user.id}`,
      );
      const data = await deviceById(this.eldService, id);
      return res.status(HttpStatus.OK).send({
        message: 'Device Found',
        data: data,
      });
    } catch (err) {
      Logger.error({ message: err.message, stack: err.stack });
      throw err;
    }
  }

  @AddDecorators()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'deviceDocument', maxCount: 10 }]),
  )
  async addEld(
    @Body() eldModel: EldRequest,
    @UploadedFiles()
    files: {
      deviceDocument: Express.Multer.File[];
    },
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const { tenantId } = request.user ?? ({ tenantId: undefined } as any);
      const option = {
        $and: [
          { serialNo: { $regex: new RegExp(`^${eldModel.serialNo}`, 'i') } },
          { tenantId: tenantId },
        ],
      };

      // Find eld
      const deviceResponse = await addAndUpdate(
        this.eldService,
        eldModel,
        option,
      );

      // Docs uploading
      const deviceRequest = await uploadDocument(
        files?.deviceDocument,
        // this.awsService,
        eldModel,
        tenantId,
      );

      // If ELD not exists
      if (deviceResponse) {
        // Create an ELD
        const device = await this.eldService.addEld(
          deviceRequest as EldRequest,
          tenantId,
        );

        if (device && Object.keys(device).length > 0) {
          const result: EldResponse = new EldResponse(device);

          // Create a unit having eld info
          // comment create a unit having eld info as we now create unit on vehicle creation time
          // await this.eldService.addDeviceAssigned(result, tenantId);
          return response.status(HttpStatus.CREATED).send({
            message: 'Device has been added successfully',
            data: result,
          });
        } else {
          throw new InternalServerErrorException(`device not added`);
        }
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }

  // @----------------------update Eld-------------------------------
  @UpdateByIdDecorators()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'deviceDocument', maxCount: 10 }]),
  )
  async update(
    @Param('id', MongoIdValidationPipe) id: string,
    @UploadedFiles()
    files: {
      deviceDocument: Express.Multer.File[];
    },
    @Body() editRequestData: EditRequest,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      Logger.log(
        `${request.method} request received from ${request.ip} for ${
          request.originalUrl
        }by: ${
          !response.locals.user ? 'Unauthorized User' : response.locals.user.id
        }`,
      );
      const { tenantId } = request.user ?? ({ tenantId: undefined } as any);
      Logger.log(`Request to update device  with param id:${id}`);
      const option = {
        serialNo: { $regex: new RegExp(`^${editRequestData.serialNo}`, 'i') },
        $and: [{ _id: { $ne: id }, isDeleted: false }, { tenantId: tenantId }],
      };
      const deviceResponse = await addAndUpdate(
        this.eldService,
        editRequestData,
        option,
      );

      if (deviceResponse) {
        const assignedDevices = await this.eldService.getAssignedDevices(
          'deviceId',
        );

        if (
          assignedDevices &&
          assignedDevices.length > 0 &&
          assignedDevices.includes(id)
        ) {
          delete editRequestData.serialNo;
        }
        const deviceRequest = await uploadDocument(
          files?.deviceDocument,
          // this.awsService,
          editRequestData,
          tenantId,
        );
        const eldResponse = await this.eldService.updateEld(id, deviceRequest);
        if (eldResponse && Object.keys(eldResponse).length > 0) {
          const result: EldResponse = new EldResponse(eldResponse);
          // comment create a unit having eld info as we now create unit on vehicle creation time
          // await this.eldService.addDeviceAssigned(result, tenantId);
          Logger.log(`update Device Data with id:${id}`);
          if (result) {
            return response.status(HttpStatus.OK).send({
              message: 'Device has been updated successfully',
              data: result,
            });
          }
        } else {
          Logger.log(`Device not Update or id not Found :${id}`);
          throw new NotFoundException(`${id} does not exist`);
        }
      }
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      throw error;
    }
  }
}
