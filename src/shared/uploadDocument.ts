import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { EditRequest, EldRequest } from 'models';
import moment from 'moment';

export const uploadDocument = async (
  doc: any,
  // awsService: AwsService,
  model: EldRequest | EditRequest,
  tenantId: string,
) => {
  // if (doc && doc.length > 0) {
  //   model.documents = [];
  //   for (let item of doc) {
  //     let key = await awsService.uploadFile(
  //       item?.buffer,
  //       `${tenantId}/${model.serialNo}/deviceDocuments/${moment().unix()}-${
  //         item?.originalname
  //       }`,
  //       item.mimetype,
  //     );
  //     model.documents.push({
  //       key: key.key,
  //       name: item?.originalname,
  //       date: moment().unix(),
  //     });
  //   }
  // }
  return model;
};
