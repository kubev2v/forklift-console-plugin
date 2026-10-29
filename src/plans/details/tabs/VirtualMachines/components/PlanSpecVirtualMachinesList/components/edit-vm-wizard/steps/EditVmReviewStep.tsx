import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { getMigrateSharedDisksValue } from 'src/plans/details/tabs/Details/components/SettingsSection/components/PlanMigrateSharedDisks/utils/utils';

import WizardStepContainer from '@components/common/WizardStepContainer';
import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { EditVmWizardStepId, editVmWizardStepNames } from '../constants';
import { useEditVmWizardContext } from '../EditVmWizardContext';
import type { EditVmWizardFormValues } from '../types';
import {
  getReviewExcludedDisksCount,
  getReviewInstanceType,
  getReviewMigrateSharedDisks,
  getReviewNameTemplate,
  getReviewTargetName,
  getReviewTargetPowerState,
} from '../utils/editVmWizardReviewLabels';

const EditVmReviewStep: FC = () => {
  const { t } = useForkliftTranslation();
  const { watch } = useFormContext<EditVmWizardFormValues>();
  const { plan, providerType, vmIndex } = useEditVmWizardContext();
  const values = watch();
  const vm = getPlanVirtualMachines(plan)[vmIndex];
  const vmName = vm?.name ?? t('selected');
  const isVsphere = providerType === PROVIDER_TYPES.vsphere;
  const planSharedDisks = getMigrateSharedDisksValue(plan);

  return (
    <WizardStepContainer
      compactTitleDescription
      description={t('Review the settings for {{vmName}}. Changes apply only to this VM.', {
        vmName,
      })}
      testId="edit-vm-review-step"
      title={editVmWizardStepNames[EditVmWizardStepId.Review]}
    >
      <ExpandableReviewSection
        testId="edit-vm-review-general-section"
        title={editVmWizardStepNames[EditVmWizardStepId.General]}
      >
        <DescriptionList horizontalTermWidthModifier={{ default: '18ch' }} isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('VM target name')}</DescriptionListTerm>
            <DescriptionListDescription data-testid="edit-vm-review-target-name">
              {getReviewTargetName(values, vmName)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('VM target power state')}</DescriptionListTerm>
            <DescriptionListDescription data-testid="edit-vm-review-target-power-state">
              {getReviewTargetPowerState(plan, values)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Instance type')}</DescriptionListTerm>
            <DescriptionListDescription data-testid="edit-vm-review-instance-type">
              {getReviewInstanceType(values)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </ExpandableReviewSection>

      {isVsphere && (
        <>
          <ExpandableReviewSection
            testId="edit-vm-review-disks-section"
            title={editVmWizardStepNames[EditVmWizardStepId.Disks]}
          >
            <DescriptionList horizontalTermWidthModifier={{ default: '18ch' }} isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Excluded disks')}</DescriptionListTerm>
                <DescriptionListDescription data-testid="edit-vm-review-excluded-disks">
                  {getReviewExcludedDisksCount(values.excludeDisks)}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Shared disks')}</DescriptionListTerm>
                <DescriptionListDescription data-testid="edit-vm-review-shared-disks">
                  {getReviewMigrateSharedDisks(planSharedDisks, values.migrateSharedDisks)}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ExpandableReviewSection>

          <ExpandableReviewSection
            testId="edit-vm-review-naming-section"
            title={editVmWizardStepNames[EditVmWizardStepId.NamingTemplates]}
          >
            <DescriptionList horizontalTermWidthModifier={{ default: '18ch' }} isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('PVC name template')}</DescriptionListTerm>
                <DescriptionListDescription data-testid="edit-vm-review-pvc-template">
                  {getReviewNameTemplate(values.pvcNameTemplate)}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Volume name template')}</DescriptionListTerm>
                <DescriptionListDescription data-testid="edit-vm-review-volume-template">
                  {getReviewNameTemplate(values.volumeNameTemplate)}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Network name template')}</DescriptionListTerm>
                <DescriptionListDescription data-testid="edit-vm-review-network-template">
                  {getReviewNameTemplate(values.networkNameTemplate)}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ExpandableReviewSection>
        </>
      )}
    </WizardStepContainer>
  );
};

export default EditVmReviewStep;
