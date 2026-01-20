import { getInventoryApiUrl } from 'src/providers/utils/helpers/getApiUrl';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';
import { PHASES } from '@utils/constants';
import { t } from '@utils/i18n';

import {
  type UploadTarballResponse,
  type VddkBuild,
  type VddkBuildResponse,
  vddkBuildResponseVariant,
} from './types';

export const uploadVddkTarball = async (file: File): Promise<UploadTarballResponse> => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await consoleFetch(getInventoryApiUrl('vddk/build-image'), {
    body: formData,
    method: 'POST',
  });

  return response.json() as Promise<UploadTarballResponse>;
};

export const getVddkImageBuildResponse = (status: VddkBuild['status']): VddkBuildResponse => {
  if (status?.phase === PHASES.COMPLETE) {
    const body = status?.outputDockerImageReference.replace(
      ':latest',
      `@${status?.output?.to?.imageDigest}`,
    );
    return {
      body,
      isBuildSucceeded: true,
      variant: vddkBuildResponseVariant.success,
    };
  }

  if (status?.phase === PHASES.FAILED) {
    return {
      body: status?.logSnippet ?? '',
      isBuildFailed: true,
      title: t('Failed'),
      variant: vddkBuildResponseVariant.warning,
    };
  }

  return {
    body: t('Building image'),
    isBuilding: true,
    variant: vddkBuildResponseVariant.info,
  };
};

export const getUploadButtonText = (uploading: boolean, buildingImage?: boolean) => {
  if (uploading) return t('Uploading...');
  if (buildingImage) return t('Building image...');
  return t('Upload');
};
