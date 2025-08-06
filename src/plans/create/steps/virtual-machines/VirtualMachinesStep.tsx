import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { validateVmSelection } from '../../utils/vmValidation';
import { NetworkMapFieldId } from '../network-map/constants';
import { CreatePlanStorageMapFieldId } from '../storage-map/constants';

import { defaultVms, VmFormFieldId } from './constants';
import VirtualMachinesTable from './VirtualMachinesTable';

const VirtualMachinesStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, unregister } = useCreatePlanFormContext();
  const { error } = getFieldState(VmFormFieldId.Vms);

  return (
    <WizardStepContainer
      title={planStepNames[PlanWizardStepId.VirtualMachines]}
      isFullWidth
      testId="create-plan-vm-step"
    >
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
          rules={{ validate: validateVmSelection }}
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
