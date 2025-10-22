import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { GeneralFormFieldId } from 'src/plans/create/steps/general-information/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { VmFormFieldId } from '../virtual-machines/constants';

import { MigrationTypeFieldId, MigrationTypeValue } from './constants';
import MigrationTypeRadio from './MigrationTypeRadio';

const MigrationTypeStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const [vms, sourceProvider] = useWatch({
    control,
    name: [VmFormFieldId.Vms, GeneralFormFieldId.SourceProvider],
  });
  const cbtDisabledVms = Object.values(vms ?? {}).filter(
    (vm) => vm.providerType === PROVIDER_TYPES.vsphere && !vm.changeTrackingEnabled,
  );

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.MigrationType]}>
      <FormGroupWithErrorText isRequired fieldId={MigrationTypeFieldId.MigrationType}>
        <Controller
          name={MigrationTypeFieldId.MigrationType}
          defaultValue={MigrationTypeValue.Cold}
          control={control}
          rules={{
            required: t('Migration type is required.'),
          }}
          render={({ field: migrationTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <MigrationTypeRadio
                migrationType={MigrationTypeValue.Cold}
                value={migrationTypeField.value}
                onChange={migrationTypeField.onChange}
                sourceProvider={sourceProvider}
              />
              <MigrationTypeRadio
                migrationType={MigrationTypeValue.Warm}
                value={migrationTypeField.value}
                onChange={migrationTypeField.onChange}
                sourceProvider={sourceProvider}
                cbtDisabledVms={cbtDisabledVms}
              />
              <MigrationTypeRadio
                migrationType={MigrationTypeValue.Live}
                value={migrationTypeField.value}
                onChange={migrationTypeField.onChange}
                sourceProvider={sourceProvider}
              />
            </Flex>
          )}
        />
      </FormGroupWithErrorText>
    </WizardStepContainer>
  );
};

export default MigrationTypeStep;
