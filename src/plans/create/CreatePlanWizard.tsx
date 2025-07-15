import type { FC } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { type Location, useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { FEATURE_NAMES } from '@utils/constants';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';

import { useCreatePlanForm } from './hooks/useCreatePlanForm';
import { GeneralFormFieldId } from './steps/general-information/constants';
import { getCreatedPlanPath } from './utils/getCreatedPlanPath';
import { getDefaultFormValues } from './utils/getDefaultFormValues';
import { submitMigrationPlan } from './utils/submitMigrationPlan';
import CreatePlanWizardContextProvider from './CreatePlanWizardContextProvider';
import CreatePlanWizardInner from './CreatePlanWizardInner';
import type { CreatePlanFormData } from './types';

import './CreatePlanWizard.style.scss';

const CreatePlanWizard: FC = () => {
  const navigate = useNavigate();
  const location: Location<CreatePlanFormData> = useLocation();
  const { isFeatureEnabled } = useFeatureFlags();

  const isLiveMigrationEnabled = isFeatureEnabled(FEATURE_NAMES.OCP_LIVE_MIGRATION);
  const defaultValues = getDefaultFormValues(location.state);

  const form = useCreatePlanForm({
    defaultValues,
    mode: 'onChange',
  });

  const {
    control,
    formState: { isSubmitting },
    getValues,
    handleSubmit,
  } = form;

  const [planName, planProject, sourceProvider] = useWatch({
    control,
    name: [
      GeneralFormFieldId.PlanName,
      GeneralFormFieldId.PlanProject,
      GeneralFormFieldId.SourceProvider,
    ],
  });

  const onSubmit = async () => {
    const formData = getValues();
    await submitMigrationPlan(formData);
    navigate(getCreatedPlanPath(planName, planProject));
  };

  return (
    <FormProvider {...form}>
      <CreatePlanWizardContextProvider>
        <Wizard
          data-testid="create-plan-wizard"
          isVisitRequired
          footer={<CreatePlanWizardFooter />}
          onStepChange={(_event, step) => {
            setCurrentStep(step);
          }}
          className="create-plan-wizard"
        >
          <WizardStep
            {...getStepProps(PlanWizardStepId.BasicSetup)}
            steps={[
              <WizardStep
                key={PlanWizardStepId.General}
                {...getStepProps(PlanWizardStepId.General)}
              >
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
                onNext={handleSubmit(onSubmit)}
                hasError={hasCreatePlanError}
              />
            }
            {...getStepProps(PlanWizardStepId.ReviewAndCreate)}
          >
            <ReviewStep
              error={createPlanError}
              onBackToReviewClick={() => {
                setCreatePlanError(undefined);
              }}
            />
          </WizardStep>
        </Wizard>
      </CreatePlanWizardContextProvider>
    </FormProvider>
  );
};

export default CreatePlanWizard;
