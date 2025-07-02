import { type FC, useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import SectionHeading from 'src/components/headers/SectionHeading';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { Alert, Divider, PageSection } from '@patternfly/react-core';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import HooksCodeEditor from './components/HooksCodeEditor';
import HooksTabActions from './components/HooksTabActions/HooksTabActions';
import { usePlanHooks } from './hooks/usePlanHooks';
import { getDefaultValues } from './state/initialState';
import type { HookFormValues } from './state/types';
import { hookTypes } from './utils/constants';
import { onUpdatePlanHooks } from './utils/utils';

const PlanHooksPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { plan } = usePlan(name, namespace);

  const { error, loaded, postHookResource, preHookResource, warning } = usePlanHooks(plan);

  const methods = useForm<HookFormValues>({
    defaultValues: getDefaultValues(postHookResource, preHookResource),
  });

  const { handleSubmit, reset } = methods;

  const resetToDefaultValues = useCallback(() => {
    reset(getDefaultValues(postHookResource, preHookResource));
  }, [reset, postHookResource, preHookResource]);

  useEffect(() => {
    if (loaded && !error) {
      resetToDefaultValues();
    }
  }, [plan, loaded, error, resetToDefaultValues]);

  const onUpdate = handleSubmit(async (formData) => {
    await onUpdatePlanHooks({
      formData,
      plan,
      postHookResource: postHookResource!,
      preHookResource: preHookResource!,
    });
  });

  return (
    <FormProvider {...methods}>
      <LoadingSuspend obj={plan} loaded loadError={null}>
        <PageSection variant="light">
          <SectionHeading text={t('Hooks')} />
          {warning && (
            <Alert variant="warning" title={t('The plan hooks were manually configured')}>
              <p>
                {t('Warning:')} {warning},
              </p>
              <p>{t('updating the hooks will override the current configuration.')}</p>
            </Alert>
          )}

          <SectionHeading text={t('Migration hook')} />
          <HooksTabActions
            onCancel={resetToDefaultValues}
            onUpdate={onUpdate}
            planEditable={isPlanEditable(plan)}
          />
          <Divider />

          <HooksCodeEditor type={hookTypes.PreHook} planEditable={isPlanEditable(plan)} />

          <HooksCodeEditor type={hookTypes.PostHook} planEditable={isPlanEditable(plan)} />
        </PageSection>
      </LoadingSuspend>
    </FormProvider>
  );
};

export default PlanHooksPage;
