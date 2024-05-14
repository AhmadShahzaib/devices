import {
  Get,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';

import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  ELD,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EldResponse } from '../models/response.model';

export default function GetByIdDecorators() {
  const GetByIdDecorators: Array<CombineDecoratorType> = [
    Get(':id'),
    SetMetadata('permissions', [ELD.LIST]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: EldResponse }),
    ApiParam({
      name: 'id',
      description: 'The ID of the Eld you want to get.',
    }),
  ];
  return CombineDecorators(GetByIdDecorators);
}
