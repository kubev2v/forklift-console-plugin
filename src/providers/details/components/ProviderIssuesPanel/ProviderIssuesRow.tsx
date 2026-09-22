import { type FC, useMemo } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import VisibleTableData from 'src/components/TableCell/VisibleTableData';

import { getProviderIssuesPanelFieldsData } from './utils/getProviderIssuesPanelFieldsData';
import type { ProviderIssuesPanelData, ProviderIssuesTableResourceId } from './utils/types';

const ProviderIssuesRow: FC<RowProps<ProviderIssuesPanelData>> = ({
  resourceData,
  resourceFields,
}) => {
  const rowFields = useMemo(() => getProviderIssuesPanelFieldsData(resourceData), [resourceData]);

  return (
    <>
      {resourceFields.map(({ resourceFieldId }) => (
        <VisibleTableData
          fieldId={resourceFieldId ?? ''}
          key={resourceFieldId}
          resourceFields={resourceFields}
        >
          {rowFields[resourceFieldId as ProviderIssuesTableResourceId]}
        </VisibleTableData>
      ))}
    </>
  );
};

export default ProviderIssuesRow;
