import type { V1beta1PlanStatusMigrationVmsPipeline } from '@forklift-ui/types';
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

  const isCompleted =
    pipeline?.phase === taskStatuses.completed ||
    (pipeline?.progress !== undefined && pipeline.progress.completed === pipeline.progress.total);

  if (isCompleted)
    return (
      <Icon status="success">
        <CheckIcon />
      </Icon>
    );

  return <ResourcesEmptyIcon />;
};
