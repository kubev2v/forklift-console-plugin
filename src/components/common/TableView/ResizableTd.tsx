import type { FC } from 'react';

import { Td, type TdProps } from '@patternfly/react-table';

import { useDataViewCellScope } from '../DataViewTable/DataViewCellScope';
import { getActionCellProps } from '../DataViewTable/dataViewColumnUtils';
import type { ResourceField } from '../utils/types';

type ResizableTdProps = TdProps & {
  columnId: string | null;
  resourceFields?: ResourceField[];
};

const ResizableTd: FC<ResizableTdProps> = ({
  children,
  className,
  columnId,
  resourceFields,
  ...rest
}) => {
  const scope = useDataViewCellScope();
  if (scope) {
    if (scope.columnId !== columnId) {
      return null;
    }
    return <>{children}</>;
  }

  const isAction = Boolean(
    resourceFields?.some((field) => field.resourceFieldId === columnId && field.isAction),
  );

  return (
    <Td
      className={className}
      data-column-id={columnId ?? undefined}
      {...(isAction ? getActionCellProps() : {})}
      {...rest}
    >
      {children}
    </Td>
  );
};

export default ResizableTd;
