import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import { getDefaultNamespace } from '@utils/namespaces';

import type { VddkBuild } from '../utils/types';
import { getVddkImageBuildResponse } from '../utils/utils';

export const useVddkBuildImage = (buildName: string) => {
  const [vddkBuild] = useK8sWatchResource<VddkBuild>(
    buildName
      ? {
          groupVersionKind: {
            group: 'build.openshift.io',
            kind: 'Build',
            version: 'v1',
          },
          name: buildName,
          namespace: getDefaultNamespace(),
        }
      : null,
  );

  if (isEmpty(vddkBuild)) return null;

  const buildImageResponse = getVddkImageBuildResponse(vddkBuild?.status);

  return buildImageResponse;
};
