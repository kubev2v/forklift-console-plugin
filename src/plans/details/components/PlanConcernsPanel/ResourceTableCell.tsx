import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { TableCell } from 'src/components/TableCell/TableCell';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';
import { useForkliftTranslation } from '@utils/i18n';

import { CONCERN_SOURCE, type PlanConcernsPanelData } from './utils/types';

type ResourceTableCellProps = {
  fieldsData: PlanConcernsPanelData;
};

const getFilterParams = (source: string, type: string): string => {
  switch (source) {
    case CONCERN_SOURCE.INSPECTION:
      return `inspectionStatus=["${INSPECTION_STATUS.ISSUES_FOUND}"]`;
    case CONCERN_SOURCE.INVENTORY:
    case CONCERN_SOURCE.CONDITION:
    default:
      return `concerns-type=["${type}"]&concerns=["Critical"]`;
  }
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
            const filterParams = getFilterParams(condition?.source, condition?.type);
            navigate(fieldsData?.planUrl)?.catch(() => undefined);
            navigate(`${fieldsData?.planUrl}/vms?${filterParams}`, { replace: true })?.catch(
              () => undefined,
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
