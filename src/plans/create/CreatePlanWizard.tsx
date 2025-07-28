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
