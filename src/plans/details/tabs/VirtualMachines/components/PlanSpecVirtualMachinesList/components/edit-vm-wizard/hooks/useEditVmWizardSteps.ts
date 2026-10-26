import { useMemo } from 'react';

import type { ProviderType } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { EditVmWizardStepId } from '../constants';

export const useEditVmWizardSteps = (providerType?: ProviderType): EditVmWizardStepId[] =>
  useMemo(() => {
    const isVsphere = providerType === PROVIDER_TYPES.vsphere;

    if (isVsphere) {
      return [
        EditVmWizardStepId.General,
        EditVmWizardStepId.Disks,
        EditVmWizardStepId.NamingTemplates,
        EditVmWizardStepId.Review,
      ];
    }

    return [EditVmWizardStepId.General, EditVmWizardStepId.Review];
  }, [providerType]);
