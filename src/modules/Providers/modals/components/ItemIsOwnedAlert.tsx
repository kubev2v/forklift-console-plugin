import type { FC } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  getGroupVersionKindForResource,
  type OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import './alerts.style.css';

type ItemIsOwnedAlertProps = {
  owner: OwnerReference;
  namespace?: string;
  className?: string;
};

export const ItemIsOwnedAlert: FC<ItemIsOwnedAlertProps> = ({ className, namespace, owner }) => {
  const { t } = useForkliftTranslation();
  if (isEmpty(owner)) {
    return null;
  }

  return (
    <Alert
      className={className ?? 'co-alert forklift-alert--margin-top'}
      isInline
      variant="warning"
      title={t('Managed resource')}
    >
      <ForkliftTrans>
        This resource is managed by{' '}
        <ResourceLink
          className="modal__inline-resource-link"
          inline
          groupVersionKind={getGroupVersionKindForResource(owner)}
          name={owner.name}
          // Note: owner must be on the same namespace as resource:
          // https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/
          namespace={namespace}
        />{' '}
        and any modifications might be overwritten. Edit the managing resource to preserve changes.
      </ForkliftTrans>
    </Alert>
  );
};
