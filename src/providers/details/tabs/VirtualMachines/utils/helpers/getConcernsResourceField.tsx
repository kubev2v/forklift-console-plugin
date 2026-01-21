import { CustomFilterType } from 'src/components/common/FilterGroup/constants';

import type { ResourceField } from '@components/common/utils/types';
import ConcernsColumnPopover from '@components/Concerns/ConcernsColumnPopover';
import { t } from '@utils/i18n';

import { concernFilter } from '../filters/concernFilter';

export const getConcernsResourceField = (): ResourceField => ({
  filter: concernFilter(),
  info: {
    ariaLabel: 'More information on concerns',
    popover: <ConcernsColumnPopover />,
  },
  isVisible: true,
  jsonPath: '$.vm.concerns',
  label: t('Concerns'),
  resourceFieldId: CustomFilterType.Concerns,
  sortable: true,
});
