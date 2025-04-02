import { type FC, type ReactNode, useMemo } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

type VisibleTableDataProps = {
  fieldId: string;
  resourceFields: ResourceField[];
  children: ReactNode;
};

const VisibleTableData: FC<VisibleTableDataProps> = ({ children, fieldId, resourceFields }) => {
  const isVisible = useMemo(
    () => resourceFields.some((field) => field.resourceFieldId === fieldId),
    [fieldId, resourceFields],
  );

  if (!isVisible) return null;

  return <Td dataLabel={fieldId}>{children}</Td>;
};

export default VisibleTableData;
