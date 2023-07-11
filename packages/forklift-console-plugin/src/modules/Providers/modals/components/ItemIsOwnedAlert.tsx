import React from 'react';
import { Trans } from 'react-i18next';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  getGroupVersionKindForResource,
  OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { Alert } from '@patternfly/react-core';

interface ItemIsOwnedAlertProps {
  owner: OwnerReference;
  namespace: string;
}

export const ItemIsOwnedAlert: React.FC<ItemIsOwnedAlertProps> = ({ owner, namespace }) => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      className="co-alert co-alert--margin-top"
      isInline
      variant="warning"
      title={t('Managed resource')}
    >
      <Trans t={t} ns="plugin__forklift-console-plugin">
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
        and any modifications may be overwritten. Edit the managing resource to preserve changes.
      </Trans>
    </Alert>
  );
};
