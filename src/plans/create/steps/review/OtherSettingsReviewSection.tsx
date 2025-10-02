import type { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

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

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';
import { otherFormFieldLabels, OtherSettingsFormFieldId } from '../other-settings/constants';

const OtherSettingsReviewSection: FC = () => {
  const { t } = useForkliftTranslation();
  const { goToStepById } = useWizardContext();
  const { control } = useCreatePlanFormContext();
  const [
    sourceProvider,
    diskPassPhrases,
    nbdeClevis,
    transferNetwork,
    preserveStaticIps,
    rootDevice,
    sharedDisks,
    targetPowerState,
  ] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      OtherSettingsFormFieldId.DiskDecryptionPassPhrases,
      OtherSettingsFormFieldId.NBDEClevis,
      OtherSettingsFormFieldId.TransferNetwork,
      OtherSettingsFormFieldId.PreserveStaticIps,
      OtherSettingsFormFieldId.RootDevice,
      OtherSettingsFormFieldId.MigrateSharedDisks,
      OtherSettingsFormFieldId.TargetPowerState,
    ],
  });
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;
  const hasNoDiskPassPhrases =
    isEmpty(diskPassPhrases) || (diskPassPhrases.length === 1 && !diskPassPhrases[0].value);

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

            {!nbdeClevis && (
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {otherFormFieldLabels[OtherSettingsFormFieldId.DiskDecryptionPassPhrases]}
                </DescriptionListTerm>

                {hasNoDiskPassPhrases ? (
                  <DescriptionListDescription data-testid="review-disk-decryption-passphrases">
                    {t('None')}
                  </DescriptionListDescription>
                ) : (
                  diskPassPhrases.map((diskPassPhrase) => (
                    <DescriptionListDescription
                      key={diskPassPhrase.value}
                      data-testid="review-disk-decryption-passphrases"
                    >
                      {diskPassPhrase.value}
                    </DescriptionListDescription>
                  ))
                )}
              </DescriptionListGroup>
            )}
          </>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>
            {otherFormFieldLabels[OtherSettingsFormFieldId.TransferNetwork]}
          </DescriptionListTerm>

          <DescriptionListDescription data-testid="review-transfer-network">
            {transferNetwork?.name ?? t('Target provider default')}
          </DescriptionListDescription>
        </DescriptionListGroup>

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
      </DescriptionList>
    </ExpandableReviewSection>
  );
};

export default OtherSettingsReviewSection;
