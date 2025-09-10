import type { K8sGroupVersionKind, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { MODEL_KIND } from '@utils/constants';
import { t } from '@utils/i18n';

import { getResourceUrl } from '../../../helpers/getResourceUrl';

const getBreadcrumbLabels = (kind: string, model: K8sModel) => {
  switch (kind) {
    case MODEL_KIND.NETWORK_MAP:
      return {
        detailsPage: t('Network map details'),
        listPage: t('Network maps'),
      };
    case MODEL_KIND.PLAN:
      return {
        detailsPage: t('Plan details'),
        listPage: t('Plans'),
      };
    case MODEL_KIND.PROVIDER:
      return {
        detailsPage: t('Provider details'),
        listPage: t('Providers'),
      };
    case MODEL_KIND.STORAGE_MAP:
      return {
        detailsPage: t('Storage map details'),
        listPage: t('Storage maps'),
      };
    default:
      return {
        detailsPage: t('{{name}} details', { name: model.label }),
        listPage: model.labelPlural,
      };
  }
};

export const breadcrumbsForModel = (model: K8sModel, namespace: string) => {
  const groupVersionKind: K8sGroupVersionKind = {
    group: model.apiGroup,
    kind: model.kind,
    version: model.apiVersion,
  };

  const labels = getBreadcrumbLabels(model.kind, model);

  return [
    {
      name: labels.listPage,
      path: getResourceUrl({ groupVersionKind, namespace }),
    },
    {
      name: labels.detailsPage,
    },
  ];
};
