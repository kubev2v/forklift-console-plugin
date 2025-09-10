import type { FC } from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { type Location, useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { CreationMethod, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
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
  const { trackEvent } = useForkliftAnalytics();

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

    trackEvent(TELEMETRY_EVENTS.PLAN_CREATE_STARTED, {
      creationMethod: CreationMethod.PlanWizard,
      planNamespace: formData.planProject,
      sourceProviderType: formData.sourceProvider?.spec?.type,
      targetNamespace: formData.targetProject,
      targetProviderType: formData.targetProvider?.spec?.type,
    });

    const trackPlanWizardEvent = (eventType: string, properties = {}) => {
      trackEvent(eventType, { ...properties, creationMethod: CreationMethod.PlanWizard });
    };

    try {
      await submitMigrationPlan(formData, trackPlanWizardEvent);

      navigate(getCreatedPlanPath(planName, planProject));
    } catch (error) {
      trackEvent(TELEMETRY_EVENTS.PLAN_CREATE_FAILED, {
        creationMethod: CreationMethod.PlanWizard,
        error: error instanceof Error ? error.message : 'Unknown error',
        planNamespace: formData.planProject,
        sourceProviderType: formData.sourceProvider?.spec?.type,
        targetNamespace: formData.targetProject,
      });

      throw error;
    }
  };

  return (
    <FormProvider {...form}>
      <CreatePlanWizardContextProvider>
        <CreatePlanWizardInner
          onSubmit={handleSubmit(onSubmit)}
          isLiveMigrationEnabled={isLiveMigrationEnabled}
          sourceProvider={sourceProvider}
          isSubmitting={isSubmitting}
        />
      </CreatePlanWizardContextProvider>
    </FormProvider>
  );
};

export default CreatePlanWizard;
