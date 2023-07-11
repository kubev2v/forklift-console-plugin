import React from 'react';
import { getIsOnlySource, TableLabelCell } from 'src/modules/Providers/utils';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common';

import { CellProps } from './CellProps';

/**
 * TypeCell component, used for displaying the type of a resource.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const TypeCell: React.FC<CellProps> = ({ data, fields }) => {
  const { t } = useForkliftTranslation();

  const { provider } = data;
  const type = getResourceFieldValue(data, 'type', fields);
  const isSource = getIsOnlySource(provider);

  return (
    <TableLabelCell hasLabel={isSource} label={t('source')} labelColor={'green'}>
      {PROVIDERS?.[type] || ''}
    </TableLabelCell>
  );
};
