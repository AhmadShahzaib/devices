import { HttpStatus, Put, SetMetadata } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

import {
  CombineDecorators,
  CombineDecoratorType,
  ELD,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EldResponse } from '../models/response.model';

export default function UpdateByIdDecorators() {
  const UpdateByIdDecorators: Array<CombineDecoratorType> = [
    Put(':id'),
    SetMetadata('permissions', [ELD.EDIT]),
    ApiConsumes('multipart/form-data'),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK, type: EldResponse }),
    ApiParam({
      name: 'id',
      description: 'The ID of the eld you want to update.',
    }),
  ];
  return CombineDecorators(UpdateByIdDecorators);
}
