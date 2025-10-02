import type { ReactNode } from 'react';

import { Label } from '@patternfly/react-core';
import { t } from '@utils/i18n';

import { PlanStatuses } from './types';

export const planStatusLabelMapper: Record<PlanStatuses, ReactNode> = {
  [PlanStatuses.Archived]: (
    <Label
      className="forklift-plan-status__dark-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Archived')}
    </Label>
  ),
  [PlanStatuses.Canceled]: (
    <Label
      className="forklift-plan-status__dark-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Canceled')}
    </Label>
  ),
  [PlanStatuses.CannotStart]: (
    <Label
      className="forklift-plan-status__grey-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Cannot start')}
    </Label>
  ),
  [PlanStatuses.Completed]: (
    <Label
      className="forklift-plan-status__dark-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Complete')}
    </Label>
  ),
  [PlanStatuses.Executing]: (
    <Label
      className="forklift-plan-status__grey-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Migration running')}
    </Label>
  ),
  [PlanStatuses.Incomplete]: (
    <Label
      className="forklift-plan-status__grey-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Incomplete')}
    </Label>
  ),
  [PlanStatuses.Paused]: (
    <Label
      className="forklift-plan-status__gold-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Paused')}
    </Label>
  ),
  [PlanStatuses.Ready]: (
    <Label
      className="forklift-plan-status__grey-label"
      isCompact
      variant="filled"
      data-testid="plan-status-label"
    >
      {t('Ready for migration')}
    </Label>
  ),
  [PlanStatuses.Unknown]: (
    <Label isCompact variant="filled" data-testid="plan-status-label">
      {t('Unknown')}
    </Label>
  ),
};
