import type { InspectionStatus } from '@utils/crds/conversion/constants';
import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';

type StatusDescription = {
  description: string;
  label: string;
};

export const STATUS_DESCRIPTIONS: Record<InspectionStatus, StatusDescription> = {
  [INSPECTION_STATUS.CANCELED]: {
    description: 'The inspection was canceled.',
    label: 'Canceled',
  },
  [INSPECTION_STATUS.FAILED]: {
    description: 'The inspection itself failed.',
    label: 'Failed',
  },
  [INSPECTION_STATUS.INSPECTION_PASSED]: {
    description: 'The inspection was completed and no issues were found.',
    label: 'Inspection passed',
  },
  [INSPECTION_STATUS.ISSUES_FOUND]: {
    description:
      'The inspection was completed and issues were found. Issues are grouped by severity. Click a severity badge to see the individual concerns.',
    label: 'Issues found',
  },
  [INSPECTION_STATUS.NOT_INSPECTED]: {
    description: 'Inspection has not been requested for this VM.',
    label: 'Not inspected',
  },
  [INSPECTION_STATUS.PENDING]: {
    description: 'Inspection was requested but has not started yet.',
    label: 'Pending',
  },
  [INSPECTION_STATUS.RUNNING]: {
    description: 'The inspection is in progress.',
    label: 'Running',
  },
};

export const POPOVER_ORDER: InspectionStatus[] = [
  INSPECTION_STATUS.NOT_INSPECTED,
  INSPECTION_STATUS.PENDING,
  INSPECTION_STATUS.RUNNING,
  INSPECTION_STATUS.FAILED,
  INSPECTION_STATUS.ISSUES_FOUND,
  INSPECTION_STATUS.INSPECTION_PASSED,
  INSPECTION_STATUS.CANCELED,
];
