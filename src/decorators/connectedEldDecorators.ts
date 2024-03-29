import {
  HttpStatus,
  Patch,
  SetMetadata,
} from '@nestjs/common';

import {
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  ELD,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EldResponse } from '../models/response.model';

export default function connectedEldDecorators() {
  const IsActiveDecorators: Array<CombineDecoratorType> = [
    Patch('/connect/:id'),
    SetMetadata('permissions', [ELD.ACTIVATE]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: EldResponse }),
    ApiParam({
      name: 'id',
      description: 'The ID of the Eld you want to change the status',
    }),
  ];
  return CombineDecorators(connectedEldDecorators);
}