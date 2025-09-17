import { getInventoryApiUrl } from 'src/modules/Providers/utils/helpers/getApiUrl';

import type { V1beta1Provider } from '@kubev2v/types';
import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import { isEmpty } from './../../../utils/helpers';
import { OvaValidationVariant, type UploadOvaResponse } from './types';

export const uploadOva = async (
  provider: V1beta1Provider,
  file: File,
): Promise<UploadOvaResponse> => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await consoleFetch(getInventoryApiUrl(`appliances`), {
    body: formData,
    method: 'POST',
  });

  return response.json() as Promise<UploadOvaResponse>;
};

export const getUploadButtonLabel = (uploading: boolean) =>
  uploading ? t('Uploading...') : t('Upload');

export const validateOvaFileName = (fileName: string): OvaValidationVariant => {
  const suffix = '.ova';

  return isEmpty(fileName) || fileName.endsWith(suffix)
    ? OvaValidationVariant.Indeterminate
    : OvaValidationVariant.Error;
};
