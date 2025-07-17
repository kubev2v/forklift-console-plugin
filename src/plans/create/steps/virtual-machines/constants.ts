import { CustomFilterType } from 'src/modules/Providers/views/details/tabs/VirtualMachines/constants';

import type { ResourceField } from '@components/common/utils/types';
import { t } from '@utils/i18n';

import { criticalConcernFilter } from './utils';

export enum VmFormFieldId {
  Vms = 'vms',
}

export const criticalConcernTableField: ResourceField = {
  filter: criticalConcernFilter(),
  jsonPath: '$.vm.concerns',
  label: t('Critical concerns'),
  resourceFieldId: CustomFilterType.CriticalConcerns,
};

export const defaultVms = {};
