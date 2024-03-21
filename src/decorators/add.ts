import { HttpStatus, Post, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
  ErrorType,
  ELD,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EldResponse } from '../models/response.model';

export default function AddDecorators() {
  const AddDecorators: Array<CombineDecoratorType> = [
    Post('add'),
    SetMetadata('permissions', [ELD.ADD]),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.CREATED, type: EldResponse }),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('ELD', 'Add')),
  ];
  return CombineDecorators(AddDecorators);
}
