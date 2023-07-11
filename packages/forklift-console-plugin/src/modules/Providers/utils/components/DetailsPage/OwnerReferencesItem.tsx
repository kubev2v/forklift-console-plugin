import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  K8sResourceCommon,
  OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';

/**
 * React Component to display a list of owner references for a given Kubernetes resource.
 *
 * @component
 * @param {OwnerReferencesProps} props - Props for the OwnerReferences component.
 * @param {K8sResourceCommon} props.resource - The resource whose owner references will be displayed.
 * @returns {ReactElement} A list of owner references or a 'No owner' message if there are no owner references.
 */
export const OwnerReferencesItem: React.FC<OwnerReferencesProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const owners = (resource?.metadata?.ownerReferences || []).map((o: OwnerReference) => (
    <ResourceLink
      key={o.uid}
      groupVersionKind={{
        group: o.apiVersion.split('/')[0],
        version: o.apiVersion.split('/')[1],
        kind: o.kind,
      }}
      name={o.name}
      namespace={resource.metadata.namespace}
    />
  ));
  return owners.length ? <>{owners}</> : <span className="text-muted">{t('No owner')}</span>;
};

/**
 * Type for the props of the OwnerReferences component.
 *
 * @typedef {Object} OwnerReferencesProps
 * @property {K8sResourceCommon} resource - The resource whose owner references will be displayed.
 */
export type OwnerReferencesProps = {
  resource: K8sResourceCommon;
};
