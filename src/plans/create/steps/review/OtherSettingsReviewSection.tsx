import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  useWizardContext,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { hasLiveMigrationProviderType } from '../../utils/hasLiveMigrationProviderType';
import { GeneralFormFieldId } from '../general-information/constants';
import { MigrationTypeFieldId, MigrationTypeValue } from '../migration-type/constants';
import { otherFormFieldLabels, OtherSettingsFormFieldId } from '../other-settings/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import DiskDecryptionReviewItem from './DiskDecryptionReviewItem';

const OtherSettingsReviewSection: FC<{ isLiveMigrationFeatureEnabled: boolean }> = ({
  isLiveMigrationFeatureEnabled,
}) => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const [
    sourceProvider,
    diskPassPhrases,
    diskDecryptionType,
    existingLUKSSecret,
    nbdeClevis,
    transferNetwork,
    preserveStaticIps,
    rootDevice,
    sharedDisks,
    targetPowerState,
    migrationType,
    instanceTypes,
    vms,
  ] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      OtherSettingsFormFieldId.DiskDecryptionPassPhrases,
      OtherSettingsFormFieldId.DiskDecryptionType,
      OtherSettingsFormFieldId.ExistingLUKSSecret,
      OtherSettingsFormFieldId.NBDEClevis,
      OtherSettingsFormFieldId.TransferNetwork,
      OtherSettingsFormFieldId.PreserveStaticIps,
      OtherSettingsFormFieldId.RootDevice,
      OtherSettingsFormFieldId.MigrateSharedDisks,
      OtherSettingsFormFieldId.TargetPowerState,
      MigrationTypeFieldId.MigrationType,
      OtherSettingsFormFieldId.InstanceTypes,
      VmFormFieldId.Vms,
    ],
  });

  const instanceTypeEntries = Object.entries(instanceTypes ?? {}).filter(([, value]) =>
    Boolean(value),
  );
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  const isTransferNetworkVisible =
    !hasLiveMigrationProviderType(sourceProvider) ||
    !isLiveMigrationFeatureEnabled ||
    migrationType !== MigrationTypeValue.Live;

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.OtherSettings]}
      testId="review-other-settings-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.OtherSettings);
      }}
    >
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        {isVsphere && (
          <>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Use NBDE/Clevis')}</DescriptionListTerm>

              <DescriptionListDescription data-testid="review-nbde-clevis">
                {nbdeClevis ? t('Enabled') : t('Disabled')}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DiskDecryptionReviewItem
              diskDecryptionType={diskDecryptionType}
              diskPassPhrases={diskPassPhrases}
              existingLUKSSecret={existingLUKSSecret}
              nbdeClevis={nbdeClevis}
            />
          </>
        )}

        {isTransferNetworkVisible && (
          <DescriptionListGroup>
            <DescriptionListTerm>
              {otherFormFieldLabels[OtherSettingsFormFieldId.TransferNetwork]}
            </DescriptionListTerm>

            <DescriptionListDescription data-testid="review-transfer-network">
              {transferNetwork?.name ?? t('Target provider default')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {isVsphere && (
          <>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {otherFormFieldLabels[OtherSettingsFormFieldId.PreserveStaticIps]}
              </DescriptionListTerm>

              <DescriptionListDescription data-testid="review-preserve-static-ips">
                {preserveStaticIps ? t('Enabled') : t('Disabled')}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>
                {otherFormFieldLabels[OtherSettingsFormFieldId.RootDevice]}
              </DescriptionListTerm>

              <DescriptionListDescription data-testid="review-root-device">
                {rootDevice ?? t('First root device')}
              </DescriptionListDescription>
            </DescriptionListGroup>

            <DescriptionListGroup>
              <DescriptionListTerm>
                {otherFormFieldLabels[OtherSettingsFormFieldId.MigrateSharedDisks]}
              </DescriptionListTerm>

              <DescriptionListDescription data-testid="review-shared-disks">
                {sharedDisks ? t('Enabled') : t('Disabled')}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>
            {otherFormFieldLabels[OtherSettingsFormFieldId.TargetPowerState]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-target-power-state">
            {targetPowerState.label}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>
            {otherFormFieldLabels[OtherSettingsFormFieldId.InstanceTypes]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-instance-types">
            {isEmpty(instanceTypeEntries)
              ? t('None')
              : instanceTypeEntries.map(([vmId, instanceType]) => (
                  <div key={vmId}>
                    {vms?.[vmId]?.name ?? vmId}: {instanceType}
                  </div>
                ))}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </ExpandableReviewSection>
  );
};

export default OtherSettingsReviewSection;
