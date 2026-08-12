import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { GeneralFormFieldId } from 'src/plans/create/steps/general-information/constants';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

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
      <FormGroupWithErrorText fieldId={MigrationTypeFieldId.MigrationType} isRequired>
        <Controller
          control={control}
          defaultValue={MigrationTypeValue.Cold}
          name={MigrationTypeFieldId.MigrationType}
          render={({ field: migrationTypeField }) => (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
              <MigrationTypeRadio
                migrationType={MigrationTypeValue.Cold}
                onChange={migrationTypeField.onChange}
                sourceProvider={sourceProvider}
                value={migrationTypeField.value}
              />
              <MigrationTypeRadio
                cbtDisabledVms={cbtDisabledVms}
                migrationType={MigrationTypeValue.Warm}
                onChange={migrationTypeField.onChange}
                sourceProvider={sourceProvider}
                value={migrationTypeField.value}
              />
              <MigrationTypeRadio
                migrationType={MigrationTypeValue.Live}
                onChange={migrationTypeField.onChange}
                sourceProvider={sourceProvider}
                value={migrationTypeField.value}
              />
            </Flex>
          )}
          rules={{
            required: t('Migration type is required.'),
          }}
        />
      </FormGroupWithErrorText>
    </WizardStepContainer>
  );
};

export default MigrationTypeStep;
