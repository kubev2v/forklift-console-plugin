import { type FC, useEffect, useRef, useState } from 'react';

import type { V1beta1Provider } from '@kubev2v/types';
import { Wizard, type WizardProps, WizardStep, type WizardStepType } from '@patternfly/react-core';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { useForkliftTranslation } from '@utils/i18n';

import { useStepValidation } from './hooks/useStepValidation';
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
import { firstStep, planStepNames, planStepOrder, PlanWizardStepId } from './constants';
import CreatePlanWizardFooter from './CreatePlanWizardFooter';

type CreatePlanWizardInnerProps = {
  onSubmit: () => Promise<void>;
  isLiveMigrationEnabled: boolean;
  sourceProvider: V1beta1Provider | undefined;
  isSubmitting: boolean;
};

const CreatePlanWizardInner: FC<CreatePlanWizardInnerProps> = ({
  isLiveMigrationEnabled,
  isSubmitting,
  onSubmit,
  sourceProvider,
}) => {
  const { t } = useForkliftTranslation();
  const { trackEvent } = useForkliftAnalytics();
  const [currentStep, setCurrentStep] = useState<WizardStepType>(firstStep);
  const [createPlanError, setCreatePlanError] = useState<Error | undefined>();
  const { hasStepErrors, validateStep } = useStepValidation();
  const initialStepTracked = useRef(false);

  const hasCreatePlanError = Boolean(createPlanError?.message);

  // Track initial step visit when wizard loads
  useEffect(() => {
    if (!initialStepTracked.current) {
      initialStepTracked.current = true;
      trackEvent(TELEMETRY_EVENTS.PLAN_WIZARD_STEP_VISITED, {
        stepId: firstStep.id,
      });
    }
  }, [trackEvent]);

  const handleStepChange: WizardProps['onStepChange'] = async (_event, newStep) => {
    const currentStepId = currentStep.id as PlanWizardStepId;
    const newStepId = newStep.id as PlanWizardStepId;
    const newStepOrder = planStepOrder[newStepId];
    const currentStepOrder = planStepOrder[currentStepId];

    if (currentStepId === newStepId) {
      return;
    }

    // Allow backward navigation without validation
    if (newStepOrder <= currentStepOrder) {
      setCurrentStep(newStep);
      trackEvent(TELEMETRY_EVENTS.PLAN_WIZARD_STEP_VISITED, {
        stepId: newStepId,
      });
      return;
    }

    try {
      const isCurrentStepValid = await validateStep(currentStepId);
      if (isCurrentStepValid) {
        setCurrentStep(newStep);
        trackEvent(TELEMETRY_EVENTS.PLAN_WIZARD_STEP_VISITED, {
          stepId: newStepId,
        });
      }
    } catch {
      // Stay on current step if validation throws
    }
  };

  const handleSubmit = async () => {
    setCreatePlanError(undefined);
    try {
      await onSubmit();
    } catch (error) {
      setCreatePlanError(error as Error);
    }
  };

  const getStepProps = (id: PlanWizardStepId) => ({
    id,
    isDisabled:
      isSubmitting ||
      hasCreatePlanError ||
      (planStepOrder[id] > planStepOrder[currentStep.id as PlanWizardStepId] &&
        hasPreviousStepErrors(id, hasStepErrors)),
    name: planStepNames[id],
    ...((isSubmitting || hasCreatePlanError) && { body: null }),
  });

  return (
    <Wizard
      data-testid="create-plan-wizard"
      isVisitRequired
      footer={<CreatePlanWizardFooter />}
      onStepChange={handleStepChange}
      className="create-plan-wizard"
    >
      <WizardStep
        {...getStepProps(PlanWizardStepId.BasicSetup)}
        steps={[
          <WizardStep key={PlanWizardStepId.General} {...getStepProps(PlanWizardStepId.General)}>
            <GeneralInformationStep />
          </WizardStep>,
          <WizardStep
            key={PlanWizardStepId.VirtualMachines}
            footer={<VirtualMachinesStepFooter />}
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
              (!hasLiveMigrationProviderType(sourceProvider) || !isLiveMigrationEnabled)
            }
          >
            <MigrationTypeStep />
          </WizardStep>,
        ]}
      />

      <WizardStep
        {...getStepProps(PlanWizardStepId.AdditionalSetup)}
        steps={[
          <WizardStep
            key={PlanWizardStepId.OtherSettings}
            {...getStepProps(PlanWizardStepId.OtherSettings)}
          >
            <OtherSettingsStep />
          </WizardStep>,
          <WizardStep key={PlanWizardStepId.Hooks} {...getStepProps(PlanWizardStepId.Hooks)}>
            <HooksStep />
          </WizardStep>,
        ]}
      />

      <WizardStep
        footer={
          <CreatePlanWizardFooter
            nextButtonText={t('Create plan')}
            onNext={handleSubmit}
            hasError={hasCreatePlanError}
          />
        }
        {...getStepProps(PlanWizardStepId.ReviewAndCreate)}
      >
        <ReviewStep
          isLiveMigrationEnabled={isLiveMigrationEnabled}
          error={createPlanError}
          onBackToReviewClick={() => {
            setCreatePlanError(undefined);
          }}
        />
      </WizardStep>
    </Wizard>
  );
};

export default CreatePlanWizardInner;
