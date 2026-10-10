import { type FC, type ReactNode, useMemo } from 'react';

import ResizableTd from '@components/common/TableView/ResizableTd';
import type { ResourceField } from '@components/common/utils/types';

type VisibleTableDataProps = {
  children: ReactNode;
  className?: string;
  fieldId: string;
  resourceFields: ResourceField[];
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

  if (!isVisible) {
    return null;
  }

  return (
    <ResizableTd
      className={className}
      columnId={fieldId}
      dataLabel={fieldId}
      resourceFields={resourceFields}
    >
      {children}
    </ResizableTd>
  );
};

export default VisibleTableData;
