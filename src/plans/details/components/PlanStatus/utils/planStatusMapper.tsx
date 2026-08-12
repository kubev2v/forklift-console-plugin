import type { ReactNode } from 'react';

import { Label } from '@patternfly/react-core';
import { PF_LABEL_STATUS } from '@utils/constants';
import { t } from '@utils/i18n';

import { PlanStatuses } from './types';

export const planStatusLabelMapper: Record<PlanStatuses, ReactNode> = {
  [PlanStatuses.Archived]: (
    <Label
      className="forklift-plan-status__dark-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Archived')}
    </Label>
  ),
  [PlanStatuses.Canceled]: (
    <Label
      className="forklift-plan-status__dark-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Canceled')}
    </Label>
  ),
  [PlanStatuses.CannotStart]: (
    <Label
      data-testid="plan-status-label"
      isCompact
      status={PF_LABEL_STATUS.DANGER}
      variant="filled"
    >
      {t('Cannot start')}
    </Label>
  ),
  [PlanStatuses.Completed]: (
    <Label
      className="forklift-plan-status__dark-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Complete')}
    </Label>
  ),
  [PlanStatuses.Executing]: (
    <Label
      className="forklift-plan-status__grey-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Migration running')}
    </Label>
  ),
  [PlanStatuses.Incomplete]: (
    <Label
      className="forklift-plan-status__grey-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Incomplete')}
    </Label>
  ),
  [PlanStatuses.Paused]: (
    <Label
      className="forklift-plan-status__gold-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Paused')}
    </Label>
  ),
  [PlanStatuses.Pending]: (
    <Label color="yellow" data-testid="plan-status-label" isCompact variant="filled">
      {t('Pending')}
    </Label>
  ),
  [PlanStatuses.Ready]: (
    <Label
      className="forklift-plan-status__grey-label"
      data-testid="plan-status-label"
      isCompact
      variant="filled"
    >
      {t('Ready for migration')}
    </Label>
  ),
  [PlanStatuses.Unknown]: (
    <Label data-testid="plan-status-label" isCompact variant="filled">
      {t('Unknown')}
    </Label>
  ),
  [PlanStatuses.Validating]: (
    <Label data-testid="plan-status-label" isCompact status="info" variant="filled">
      {t('Validating')}
    </Label>
  ),
};
