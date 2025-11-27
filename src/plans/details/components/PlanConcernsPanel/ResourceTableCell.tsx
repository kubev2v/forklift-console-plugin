import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanConcernsPanelData } from './utils/types';

type ResourceTableCellProps = {
  fieldsData: PlanConcernsPanelData;
};

const ResourceTableCell: FC<ResourceTableCellProps> = ({ fieldsData }) => {
  const { t } = useForkliftTranslation();

  const navigate = useNavigate();

  const condition = fieldsData?.criticalConditionOrConcern;

  return (
    <TableCell>
      {condition?.vmsNum ? (
        <Button
          isInline
          variant={ButtonVariant.link}
          onClick={() => {
            navigate(fieldsData?.planUrl);
            navigate(
              `${fieldsData?.planUrl}/vms?concerns-type=["${condition?.type}"]&concerns=["Critical"]`,
              { replace: true },
            );
          }}
        >
          {`${condition?.vmsNum} ${t('VMs')}`}
        </Button>
      ) : (
        t('Plan')
      )}
    </TableCell>
  );
};

export default ResourceTableCell;
