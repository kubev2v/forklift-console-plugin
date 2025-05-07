import { type FC, type ReactNode, useMemo } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import { Td } from '@patternfly/react-table';

type VisibleTableDataProps = {
  fieldId: string;
  resourceFields: ResourceField[];
  children: ReactNode;
  className?: string;
};

const VisibleTableData: FC<VisibleTableDataProps> = ({
  children,
  className,
  fieldId,
  resourceFields,
}) => {
  const isVisible = useMemo(
    () => resourceFields.some((field) => field.resourceFieldId === fieldId),
    [fieldId, resourceFields],
  );

  if (!isVisible) return null;

  return (
    <Td className={className} dataLabel={fieldId}>
      {children}
    </Td>
  );
};

export default VisibleTableData;
