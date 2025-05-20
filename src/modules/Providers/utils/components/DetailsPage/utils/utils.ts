import type { K8sGroupVersionKind, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { t } from '@utils/i18n';

import { getResourceUrl } from '../../../helpers/getResourceUrl';

export const breadcrumbsForModel = (model: K8sModel, namespace: string) => {
  const groupVersionKind: K8sGroupVersionKind = {
    group: model.apiGroup,
    kind: model.kind,
    version: model.apiVersion,
  };

  return [
    {
      name: model.labelPlural,
      path: getResourceUrl({ groupVersionKind, namespace }),
    },
    {
      name: t('{{name}} Details', { name: model.label }),
    },
  ];
};
