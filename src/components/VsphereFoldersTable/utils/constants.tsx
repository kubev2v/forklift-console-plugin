import type { ResourceField } from '@components/common/utils/types';
import InspectionStatusColumnPopover from '@components/InspectVirtualMachines/InspectionStatusColumnPopover';
import { t } from '@utils/i18n';

import { COLUMN_IDS } from './types';

export const nameColumn = {
  id: COLUMN_IDS.Name,
  label: t('Name'),
};

export const defaultColumns: ResourceField[] = [
  { isVisible: true, label: t('Concerns'), resourceFieldId: COLUMN_IDS.Concerns, sortable: true },
  {
    info: {
      ariaLabel: 'More information on inspection status',
      popover: <InspectionStatusColumnPopover />,
    },
    isVisible: true,
    label: t('Inspection status'),
    resourceFieldId: COLUMN_IDS.InspectionStatus,
    sortable: true,
  },
  { isVisible: true, label: t('Host'), resourceFieldId: COLUMN_IDS.Host, sortable: true },
  { isVisible: false, label: t('Path'), resourceFieldId: COLUMN_IDS.Path, sortable: true },
  { isVisible: true, label: t('Power'), resourceFieldId: COLUMN_IDS.Power, sortable: true },
];
