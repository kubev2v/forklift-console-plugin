import type { FC } from 'react';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import TechPreviewLabel from 'src/components/PreviewLabels/TechPreviewLabel';
import { TableLabelCell } from 'src/components/TableCell/TableLabelCell';
import type { CellProps } from 'src/providers/list/components/CellProps';
import { isTechPreviewProvider, type PROVIDER_TYPES } from 'src/providers/utils/constants';
import { getIsOnlySource } from 'src/providers/utils/helpers/getIsTarget';
import { PROVIDERS } from 'src/utils/enums';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SOURCE_LABEL_COLOR, SOURCE_LABEL_TEXT } from './utils/constants';

export const TypeCell: FC<CellProps> = ({ data, fields }) => {
  const { t } = useForkliftTranslation();

  const { provider } = data;
  const type = getResourceFieldValue(data, 'type', fields);
  const isSource = getIsOnlySource(provider);
  const isTechPreview = isTechPreviewProvider(type as string);

  return (
    <TableLabelCell
      hasLabel={isSource}
      label={t(SOURCE_LABEL_TEXT)}
      labelColor={SOURCE_LABEL_COLOR}
    >
      {PROVIDERS?.[type as keyof typeof PROVIDER_TYPES] ?? ''}
      {isTechPreview && <TechPreviewLabel />}
    </TableLabelCell>
  );
};
