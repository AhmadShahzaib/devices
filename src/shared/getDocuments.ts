import { AwsService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import EldDocument from 'mongoDb/document/document';

export const getDocuments = async (
  device: EldDocument,
  awsService: AwsService,
): Promise<EldDocument> => {
  if (device.get('documents') && device?.get('documents').length > 0) {
    for (const item of device.get('documents')) {
      const url = await awsService.getObject(item.key);
      item['imagePath'] = `data:image/${item.name
        .split('.')
        .pop()};base64,${url.replace(/\s+/g, '')}`;
      delete item['key'];
    }
  }

  return device;
};
