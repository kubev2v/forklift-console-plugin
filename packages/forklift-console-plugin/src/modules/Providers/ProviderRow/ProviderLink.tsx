import React from 'react';
import { useTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

import { CellProps } from './types';

export const ProviderLink: React.FC<CellProps> = ({ resourceData }) => {
  const { t } = useTranslation();
  const { name, namespace } = resourceData?.metadata || {};
  const isManaged = (resourceData?.metadata?.ownerReferences?.length ?? 0) > 0;

  return (
    <span className="forklift-table__flex-cell">
      <ResourceLink
        groupVersionKind={ProviderModelGroupVersionKind}
        name={name}
        namespace={namespace}
      />
      {isManaged && (
        <Label isCompact color="grey" className="forklift-table__flex-cell-label">
          {t('managed')}
        </Label>
      )}
    </span>
  );
};
