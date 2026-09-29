import type { FC, ReactNode } from 'react';

import type { RowProps } from '@components/common/TableView/types';
import VisibleTableData from '@components/TableCell/VisibleTableData';
import { EMPTY_MSG } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { ExcludeDiskFieldId } from './excludeDiskFields';
import type { ExcludeDiskRowData } from './types';

const SharedWithOtherVmsCell: FC<{ shared: boolean | undefined }> = ({ shared }) => {
  const { t } = useForkliftTranslation();

  if (shared === true) {
    return <>{t('Yes')}</>;
  }

  if (shared === false) {
    return <>{t('No')}</>;
  }

  return <>{EMPTY_MSG}</>;
};

const ExcludeDiskRow: FC<RowProps<ExcludeDiskRowData>> = ({ resourceData, resourceFields }) => {
  const rowFields: Record<string, ReactNode> = {
    [ExcludeDiskFieldId.BusAddress]: <>{resourceData.busAddress}</>,
    [ExcludeDiskFieldId.FileName]: <>{resourceData.fileName}</>,
    [ExcludeDiskFieldId.Shared]: <SharedWithOtherVmsCell shared={resourceData.shared} />,
    [ExcludeDiskFieldId.Size]: <>{resourceData.sizeLabel}</>,
  };

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          fieldId={resourceFieldId ?? ''}
          key={resourceFieldId}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as ExcludeDiskFieldId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default ExcludeDiskRow;
