import type { FC } from 'react';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { getProviderTypeIcon } from 'src/plans/details/utils/constants';

import ProviderIconLink from '@components/ProviderIconLink';
import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';
import { isProviderLocalOpenshift } from '@utils/resources';

import type { CellProps } from './CellProps';

/**
 * ProviderLinkCell component, used for displaying a link cell with information about the provider.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const ProviderLinkCell: FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();

  const { provider } = data;
  const { name, namespace } = provider?.metadata ?? {};
  const localCluster = isProviderLocalOpenshift(provider);

  return (
    <TableLabelCell hasLabel={localCluster} label={t('Host cluster')} labelColor="grey">
      <ProviderIconLink
        href={getResourceUrl({
          groupVersionKind: ProviderModelGroupVersionKind,
          name,
          namespace,
        })}
        providerIcon={getProviderTypeIcon(provider?.spec?.type, isDarkTheme)}
        providerName={name}
      />
    </TableLabelCell>
  );
};
