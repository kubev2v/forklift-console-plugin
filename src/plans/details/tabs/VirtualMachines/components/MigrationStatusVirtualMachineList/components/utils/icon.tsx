import type { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';
import { Icon } from '@patternfly/react-core';
import { CheckIcon, ResourcesEmptyIcon, TimesIcon } from '@patternfly/react-icons';
import { taskStatuses } from '@utils/constants';

export const getPipelineProgressIcon = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) => {
  if (pipeline?.error)
    return (
      <Icon status="danger">
        <TimesIcon />
      </Icon>
    );
  if (pipeline?.phase === taskStatuses.completed)
    return (
      <Icon status="success">
        <CheckIcon />
      </Icon>
    );
  return <ResourcesEmptyIcon />;
};
