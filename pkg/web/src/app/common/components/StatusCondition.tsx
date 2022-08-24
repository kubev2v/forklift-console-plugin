import * as React from 'react';
import { StatusIcon, StatusType } from '@migtools/lib-ui';
import { getMostSeriousCondition } from '@app/common/helpers';
import { StatusCategoryType } from '@app/common/constants';
import { IStatusCondition } from '@app/queries/types';
import { Button, Popover } from '@patternfly/react-core';

interface IStatusConditionProps {
  status?: { conditions?: IStatusCondition[] };
  unknownFallback?: React.ReactNode;
  hideLabel?: boolean;
  buttonId?: string;
  popoverBodyId?: string;
}

export const StatusCondition: React.FunctionComponent<IStatusConditionProps> = ({
  status,
  unknownFallback = null,
  hideLabel = false,
  buttonId,
  popoverBodyId,
}: IStatusConditionProps) => {
  if (!status) return <StatusIcon status="Loading" label="Validating" />;

  const getStatusType = (severity: string): StatusType => {
    if (severity === 'Ready' || severity === StatusCategoryType.Required) {
      return 'Ok';
    }
    if (severity === StatusCategoryType.Advisory) {
      return 'Info';
    }
    if (severity === 'Pending') {
      return 'Loading';
    }
    if (severity === StatusCategoryType.Critical || severity === StatusCategoryType.Error) {
      return 'Error';
    }
    return 'Warning';
  };

  const conditions = status?.conditions || [];
  const mostSeriousCondition = getMostSeriousCondition(conditions);

  if (mostSeriousCondition === 'Unknown' && unknownFallback !== null) {
    return <>{unknownFallback}</>;
  }

  let label = mostSeriousCondition;
  if (mostSeriousCondition === StatusCategoryType.Required) {
    label = 'Not ready';
  }

  const icon = (
    <StatusIcon status={getStatusType(mostSeriousCondition)} label={!hideLabel ? label : null} />
  );

  if (conditions.length === 0) return icon;

  return (
    <Popover
      hasAutoWidth
      bodyContent={
        <div {...(popoverBodyId ? { id: popoverBodyId } : {})}>
          {conditions.map((condition) => {
            const severity = getMostSeriousCondition([condition]);
            return (
              <StatusIcon
                key={condition.message}
                status={getStatusType(severity)}
                label={condition.message}
              />
            );
          })}
        </div>
      }
    >
      <Button variant="link" isInline {...(buttonId ? { id: buttonId } : {})} aria-label={label}>
        {icon}
      </Button>
    </Popover>
  );
};
