import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  type K8sResourceCommon,
  type OwnerReference,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { getGroupVersionKindFromOwnerReference } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

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
  const ownerReferences = resource?.metadata?.ownerReferences ?? [];

  if (isEmpty(ownerReferences)) {
    return <span className="text-muted">{t('No owner')}</span>;
  }

  return (
    <>
      {ownerReferences.map((ownerReference: OwnerReference) => (
        <ResourceLink
          groupVersionKind={getGroupVersionKindFromOwnerReference(ownerReference)}
          key={ownerReference.uid}
          name={ownerReference.name}
          namespace={resource.metadata?.namespace}
        />
      ))}
    </>
  );
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
