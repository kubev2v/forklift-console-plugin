import { type FC, useCallback } from 'react';
import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import type { ProviderVirtualMachine } from '@kubev2v/types';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { NetworkMapFieldId } from '../network-map/constants';
import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

import { defaultVms, VmFormFieldId } from './constants';
import VirtualMachinesTable from './VirtualMachinesTable';

const VirtualMachinesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, unregister } = useCreatePlanFormContext();
  const { error } = getFieldState(VmFormFieldId.Vms);

  const validate = useCallback(
    (value: Record<string, ProviderVirtualMachine>) => {
      if (isEmpty(value) || Object.keys(value).length === 0) {
        return t('Must select at least 1 VM.');
      }

      return undefined;
    },
    [t],
  );

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.VirtualMachines]} isFullWidth>
      <Stack hasGutter>
        <p>
          {t(
            "Select the virtual machines you want to migrate. To help find the virtual machines you're looking for, try using the filters.",
          )}
        </p>

        {error && <Alert variant={AlertVariant.danger} isInline title={error.message} />}

        <Controller
          name={VmFormFieldId.Vms}
          control={control}
          rules={{ validate }}
          defaultValue={defaultVms}
          render={({ field }) => (
            <VirtualMachinesTable
              isSelectable
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                unregister([NetworkMapFieldId.NetworkMap, CreatePlanStorageMapFieldId.StorageMap]);
              }}
            />
          )}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default VirtualMachinesStep;
