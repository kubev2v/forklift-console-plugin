import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableLabelCell } from 'src/modules/Providers/utils/components/TableCell/TableLabelCell';
import { getIsOnlySource } from 'src/modules/Providers/utils/helpers/getIsTarget';
import type { CellProps } from 'src/modules/Providers/views/list/components/CellProps';
import type { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SOURCE_LABEL_COLOR, SOURCE_LABEL_TEXT } from './utils/constants';

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
    <TableLabelCell
      hasLabel={isSource}
      label={t(SOURCE_LABEL_TEXT)}
      labelColor={SOURCE_LABEL_COLOR}
    >
      {PROVIDERS?.[type as keyof typeof PROVIDER_TYPES] ?? ''}
    </TableLabelCell>
  );
};
