import { t } from '@utils/i18n';

import ConcernsColumnPopover from '../../components/ConcernsColumnPopover';
import { CustomFilterType } from '../../constants';
import { concernFilter } from '../filters/concernFilter';

export const getConcernsResourceField = () => ({
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
