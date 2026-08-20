import { type FC, useState } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import { Wizard, WizardStep } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useStepNavigation } from './hooks/useStepNavigation';
import CustomScriptsStep from './steps/customization-scripts/CustomScriptsStep';
import GeneralInformationStep from './steps/general-information/GeneralInformationStep';
import HooksStep from './steps/migration-hooks/HooksStep';
import MigrationTypeStep from './steps/migration-type/MigrationTypeStep';
import NetworkMapStep from './steps/network-map/NetworkMapStep';
import OtherSettingsStep from './steps/other-settings/OtherSettingsStep';
import ReviewStep from './steps/review/ReviewStep';
import StorageMapStep from './steps/storage-map/StorageMapStep';
import VirtualMachinesStep from './steps/virtual-machines/VirtualMachinesStep';
import VirtualMachinesStepFooter from './steps/virtual-machines/VirtualMachinesStepFooter';
import { hasLiveMigrationProviderType } from './utils/hasLiveMigrationProviderType';
import { hasPreviousStepErrors } from './utils/hasPreviousStepErrors';
import { hasWarmMigrationProviderType } from './utils/hasWarmMigrationProviderType';
import { planStepNames, planStepOrder, PlanWizardStepId } from './constants';
import CreatePlanWizardFooter from './CreatePlanWizardFooter';

type CreatePlanWizardInnerProps = {
  isLiveMigrationFeatureEnabled: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
  sourceProvider: V1beta1Provider | undefined;
};

const CreatePlanWizardInner: FC<CreatePlanWizardInnerProps> = ({
  isLiveMigrationFeatureEnabled,
  isSubmitting,
  onSubmit,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const [createPlanError, setCreatePlanError] = useState<Error | undefined>();
  const { currentStep, handleStepChange, hasStepErrors } = useStepNavigation();

  const hasCreatePlanError = Boolean(createPlanError?.message);

  const handleSubmit = async (): Promise<void> => {
    setCreatePlanError(undefined);
    try {
      await onSubmit();
    } catch (error) {
      setCreatePlanError(error as Error);
    }
  };

  const getStepProps = (
    id: PlanWizardStepId,
  ): { id: PlanWizardStepId; isDisabled: boolean; name: string } => ({
    id,
    isDisabled:
      isSubmitting ||
      hasCreatePlanError ||
      (planStepOrder[id] > planStepOrder[currentStep.id as PlanWizardStepId] &&
        hasPreviousStepErrors(id, hasStepErrors)),
    name: planStepNames[id],
  });

  return (
    <Wizard
      className="create-plan-wizard"
      data-testid="create-plan-wizard"
      footer={<CreatePlanWizardFooter />}
      isVisitRequired
      nav={{ isExpanded: true }}
      onStepChange={handleStepChange}
    >
      <WizardStep
        {...getStepProps(PlanWizardStepId.BasicSetup)}
        isExpandable
        steps={[
          <WizardStep key={PlanWizardStepId.General} {...getStepProps(PlanWizardStepId.General)}>
            <GeneralInformationStep />
          </WizardStep>,
          <WizardStep
            footer={<VirtualMachinesStepFooter />}
            key={PlanWizardStepId.VirtualMachines}
            {...getStepProps(PlanWizardStepId.VirtualMachines)}
          >
            <VirtualMachinesStep />
          </WizardStep>,
          <WizardStep
            key={PlanWizardStepId.NetworkMap}
            {...getStepProps(PlanWizardStepId.NetworkMap)}
          >
            <NetworkMapStep />
          </WizardStep>,
          <WizardStep
            key={PlanWizardStepId.StorageMap}
            {...getStepProps(PlanWizardStepId.StorageMap)}
          >
            <StorageMapStep />
          </WizardStep>,
          <WizardStep
            key={PlanWizardStepId.MigrationType}
            {...getStepProps(PlanWizardStepId.MigrationType)}
            isHidden={
              !hasWarmMigrationProviderType(sourceProvider) &&
              (!hasLiveMigrationProviderType(sourceProvider) || !isLiveMigrationFeatureEnabled)
            }
          >
            <MigrationTypeStep />
          </WizardStep>,
        ]}
      />

      <WizardStep
        {...getStepProps(PlanWizardStepId.AdditionalSetup)}
        isExpandable
        steps={[
          <WizardStep
            key={PlanWizardStepId.OtherSettings}
            {...getStepProps(PlanWizardStepId.OtherSettings)}
          >
            <OtherSettingsStep isLiveMigrationFeatureEnabled={isLiveMigrationFeatureEnabled} />
          </WizardStep>,
          <WizardStep
            key={PlanWizardStepId.Automation}
            {...getStepProps(PlanWizardStepId.Automation)}
          >
            <CustomScriptsStep />
          </WizardStep>,
          <WizardStep key={PlanWizardStepId.Hooks} {...getStepProps(PlanWizardStepId.Hooks)}>
            <HooksStep />
          </WizardStep>,
        ]}
      />

      <WizardStep
        footer={
          <CreatePlanWizardFooter
            hasError={hasCreatePlanError}
            nextButtonText={t('Create plan')}
            onNext={handleSubmit}
          />
        }
        {...getStepProps(PlanWizardStepId.ReviewAndCreate)}
      >
        <ReviewStep
          error={createPlanError}
          isLiveMigrationFeatureEnabled={isLiveMigrationFeatureEnabled}
          onBackToReviewClick={() => {
            setCreatePlanError(undefined);
          }}
        />
      </WizardStep>
    </Wizard>
  );
};

export default CreatePlanWizardInner;
