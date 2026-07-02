import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Flex, FlexItem, Form, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { hasLiveMigrationProviderType } from '../../utils/hasLiveMigrationProviderType';
import { GeneralFormFieldId } from '../general-information/constants';
import { MigrationTypeFieldId, MigrationTypeValue } from '../migration-type/constants';

import {
  DiskDecryptionType,
  DiskDecryptionTypeLabels,
  OtherSettingsFormFieldId,
} from './constants';
import DiskPassPhraseFieldTable from './DiskPassPhraseFieldTable';
import ExistingLUKSSecretField from './ExistingLUKSSecretField';
import InstanceTypeField from './InstanceTypeField';
import NBDEClevisField from './NBDEClevisField';
import PreserveStaticIpsField from './PreserveStaticIpsField';
import RootDeviceField from './RootDeviceField';
import SharedDisksField from './SharedDisksField';
import TargetPowerStateField from './TargetPowerStateField';
import TransferNetworkField from './TransferNetworkField';

const OtherSettingsStep: FC<{ isLiveMigrationFeatureEnabled: boolean }> = ({
  isLiveMigrationFeatureEnabled,
}) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const [sourceProvider, nbdeClevis, migrationType] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      OtherSettingsFormFieldId.NBDEClevis,
      MigrationTypeFieldId.MigrationType,
    ],
  });
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  const isTransferNetworkVisible =
    !hasLiveMigrationProviderType(sourceProvider) ||
    !isLiveMigrationFeatureEnabled ||
    migrationType !== MigrationTypeValue.Live;

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.OtherSettings]}>
      <Form>
        {isVsphere && (
          <>
            <NBDEClevisField />
            {!nbdeClevis && (
              <Controller
                name={OtherSettingsFormFieldId.DiskDecryptionType}
                control={control}
                render={({ field: diskDecryptionTypeField }) => (
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
                    <FlexItem>
                      <Stack hasGutter>
                        <Radio
                          data-testid="use-existing-luks-secret-radio"
                          id={DiskDecryptionType.Existing}
                          name={OtherSettingsFormFieldId.DiskDecryptionType}
                          label={DiskDecryptionTypeLabels[DiskDecryptionType.Existing]}
                          value={DiskDecryptionType.Existing}
                          isChecked={diskDecryptionTypeField.value === DiskDecryptionType.Existing}
                          onChange={() => {
                            diskDecryptionTypeField.onChange(DiskDecryptionType.Existing);
                          }}
                          description={t(
                            'Select a pre-existing secret containing LUKS decryption keys.',
                          )}
                        />

                        {diskDecryptionTypeField.value === DiskDecryptionType.Existing && (
                          <ExistingLUKSSecretField />
                        )}
                      </Stack>
                    </FlexItem>

                    <FlexItem>
                      <Stack hasGutter>
                        <Radio
                          data-testid="use-new-passphrases-radio"
                          id={DiskDecryptionType.New}
                          name={OtherSettingsFormFieldId.DiskDecryptionType}
                          label={DiskDecryptionTypeLabels[DiskDecryptionType.New]}
                          description={t(
                            'Provide passphrases that will be stored in a new secret owned by this plan.',
                          )}
                          value={DiskDecryptionType.New}
                          isChecked={diskDecryptionTypeField.value === DiskDecryptionType.New}
                          onChange={() => {
                            diskDecryptionTypeField.onChange(DiskDecryptionType.New);
                          }}
                        />

                        {diskDecryptionTypeField.value === DiskDecryptionType.New && (
                          <DiskPassPhraseFieldTable />
                        )}
                      </Stack>
                    </FlexItem>
                  </Flex>
                )}
              />
            )}
          </>
        )}

        {isTransferNetworkVisible && <TransferNetworkField />}

        {isVsphere && (
          <>
            <PreserveStaticIpsField />
            <RootDeviceField />
            <SharedDisksField />
          </>
        )}

        <TargetPowerStateField />

        <InstanceTypeField />
      </Form>
    </WizardStepContainer>
  );
};

export default OtherSettingsStep;
