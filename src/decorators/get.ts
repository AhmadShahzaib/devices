import {
  Get,
  HttpStatus,
  SetMetadata
} from '@nestjs/common';

import { ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { sortableAttributes } from '../models';
import {
  CombineDecorators,
  CombineDecoratorType,
  ErrorType,
  ELD,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EldResponse } from '../models/response.model';

export default function GetDecorators() {
  const GetDecorators: Array<CombineDecoratorType> = [
    Get(),
    SetMetadata('permissions', [ELD.LIST]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: EldResponse }),
    ApiQuery({
      name: 'search',
      example: 'search by deviceName ,vendor, deviceVersion etc',
      required: false,
    }),
    ApiQuery({
      name: 'orderBy',
      example: 'Field by which record will be ordered',
      enum: sortableAttributes,
      required: false,
    }),
    ApiQuery({
      name: 'orderType',
      example: 'Ascending(1),Descending(-1)',
      enum: [1, -1],
      required: false,
    }),
    ApiQuery({
      name: 'pageNo',
      example: '1',
      description: 'The pageNo you want to get e.g 1,2,3 etc',
      required: false,
    }),
    ApiQuery({
      name: 'limit',
      example: '10',
      description: 'The number of records you want on one page.',
      required: false,
    }),
  ];
  return CombineDecorators(GetDecorators);
}
