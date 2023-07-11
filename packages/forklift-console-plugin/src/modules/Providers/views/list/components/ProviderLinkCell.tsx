import React from 'react';
import { TableLinkCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind } from '@kubev2v/types';

import { CellProps } from './CellProps';

/**
 * ProviderLinkCell component, used for displaying a link cell with information about the provider.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const ProviderLinkCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { provider } = data;
  const { name, namespace } = provider?.metadata || {};
  const localCluster =
    provider?.spec?.type === 'openshift' && (!provider?.spec?.url || provider?.spec?.url === '');

  return (
    <TableLinkCell
      groupVersionKind={ProviderModelGroupVersionKind}
      name={name}
      namespace={namespace}
      hasLabel={localCluster}
      labelColor="grey"
      label={t('Host cluster')}
    />
  );
};
