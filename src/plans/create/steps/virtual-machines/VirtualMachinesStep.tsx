import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { validateVmSelection } from '../../utils/vmValidation';
import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

import { defaultVms, VmFormFieldId } from './constants';
import VirtualMachinesTable from './VirtualMachinesTable';

const VirtualMachinesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, unregister } = useCreatePlanFormContext();
  const { error } = getFieldState(VmFormFieldId.Vms);

  return (
    <WizardStepContainer
      isFullWidth
      testId="create-plan-vm-step"
      title={planStepNames[PlanWizardStepId.VirtualMachines]}
    >
      <Stack hasGutter>
        <p>
          {t(
            "Select the virtual machines you want to migrate. To help find the virtual machines you're looking for, try using the filters.",
          )}
        </p>

        {error && <Alert isInline title={error.message} variant={AlertVariant.danger} />}

        <Controller
          control={control}
          defaultValue={defaultVms}
          name={VmFormFieldId.Vms}
          render={({ field }) => (
            <VirtualMachinesTable
              isSelectable
              onChange={(value) => {
                field.onChange(value);
                unregister([NetworkMapFieldId.NetworkMap, CreatePlanStorageMapFieldId.StorageMap]);
              }}
              value={field.value}
            />
          )}
          rules={{ validate: validateVmSelection }}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default VirtualMachinesStep;
