import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import { getIsOnlySource } from 'src/modules/Providers/utils/helpers/getIsTarget';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { CellProps } from './CellProps';

/**
 * TypeCell component, used for displaying the type of a resource.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const TypeCell: FC<CellProps> = ({ data, fields }) => {
  const { t } = useForkliftTranslation();

  const { provider } = data;
  const type = getResourceFieldValue(data, 'type', fields);
  const isSource = getIsOnlySource(provider);

  return (
    <TableLabelCell hasLabel={isSource} label={t('source')} labelColor={'green'}>
      {PROVIDERS?.[type] ?? ''}
    </TableLabelCell>
  );
};
