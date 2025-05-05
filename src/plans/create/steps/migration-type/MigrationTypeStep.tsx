import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, Flex, FlexItem, Radio, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { CBT_HELP_LINK, WARM_MIGRATION_HELP_LINK } from '@utils/links';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';
import { ProviderType } from '../../types';
import { VmFormFieldId } from '../virtual-machines/constants';

import { MigrationTypeFieldId, migrationTypeLabels, MigrationTypeValue } from './constants';

const MigrationTypeStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const vms = useWatch({ control, name: VmFormFieldId.Vms });
  const cbtDisabledVms = Object.values(vms ?? {}).filter(
    (vm) => vm.providerType === ProviderType.Vsphere && !vm.changeTrackingEnabled,
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
              <Radio
                id={MigrationTypeValue.Cold}
                name={MigrationTypeValue.Cold}
                label={migrationTypeLabels[MigrationTypeValue.Cold]}
                checked={migrationTypeField.value === MigrationTypeValue.Cold}
                description={t(
                  'A cold migration moves a shut down virtual machine (VM) between hosts.',
                )}
                value={migrationTypeField.value}
                isChecked={migrationTypeField.value === MigrationTypeValue.Cold}
                onChange={() => {
                  migrationTypeField.onChange(MigrationTypeValue.Cold);
                }}
              />

              <Radio
                id={MigrationTypeValue.Warm}
                name={MigrationTypeValue.Warm}
                label={
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsNone' }}
                  >
                    <FlexItem>{migrationTypeLabels[MigrationTypeValue.Warm]}</FlexItem>

                    <HelpIconPopover
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Stack hasGutter>
                        <StackItem>
                          {t(
                            'This type of migration reduces downtime by copying most of the VM data during a precopy stage while the VMs are running. During the cutover stage, the VMs are stopped and the rest of the data is copied. This is different from a live migration, where there is zero downtime.',
                          )}
                        </StackItem>

                        <StackItem>
                          <ExternalLink isInline href={WARM_MIGRATION_HELP_LINK}>
                            {t('Learn more')}
                          </ExternalLink>
                        </StackItem>
                      </Stack>
                    </HelpIconPopover>
                  </Flex>
                }
                description={t(
                  'A warm migration migrates an active virtual machine (VM) from one host to another with minimal downtime.  This is not live migration.',
                )}
                value={migrationTypeField.value}
                isChecked={migrationTypeField.value === MigrationTypeValue.Warm}
                onChange={() => {
                  migrationTypeField.onChange(MigrationTypeValue.Warm);
                }}
              />

              {migrationTypeField.value === MigrationTypeValue.Warm && !isEmpty(cbtDisabledVms) && (
                <Alert
                  isInline
                  variant="warning"
                  title={t('Must enable Changed Block Tracking (CBT) for warm migration')}
                  className="pf-v5-u-ml-lg"
                >
                  <Stack hasGutter>
                    <p>
                      {cbtDisabledVms.length} of your selected VMs do not have CBT enabled. Switch
                      the VMs to cold migration or enable CBT in VMware. If CBT is not enabled
                      before starting the migration plan, the migration will fail.
                    </p>

                    <ExternalLink isInline href={CBT_HELP_LINK}>
                      {t('Learn more')}
                    </ExternalLink>
                  </Stack>
                </Alert>
              )}
            </Flex>
          )}
        />
      </FormGroupWithErrorText>
    </WizardStepContainer>
  );
};

export default MigrationTypeStep;
