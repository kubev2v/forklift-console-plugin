import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  type K8sResourceCommon,
  type OwnerReference,
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
export const OwnerReferencesItem: FC<OwnerReferencesProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const owners = (resource?.metadata?.ownerReferences || []).map(
    (ownerReference: OwnerReference) => (
      <ResourceLink
        key={ownerReference.uid}
        groupVersionKind={{
          group: ownerReference.apiVersion.split('/')[0],
          kind: ownerReference.kind,
          version: ownerReference.apiVersion.split('/')[1],
        }}
        name={ownerReference.name}
        namespace={resource.metadata.namespace}
      />
    ),
  );
  return owners.length ? <>{owners}</> : <span className="text-muted">{t('No owner')}</span>;
};

/**
 * Type for the props of the OwnerReferences component.
 *
 * @typedef {Object} OwnerReferencesProps
 * @property {K8sResourceCommon} resource - The resource whose owner references will be displayed.
 */
type OwnerReferencesProps = {
  resource: K8sResourceCommon;
};
