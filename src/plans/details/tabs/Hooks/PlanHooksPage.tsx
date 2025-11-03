import { type FC, useCallback, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import SectionHeading from 'src/components/headers/SectionHeading';
import TabTitle from 'src/overview/components/TabTitle';
import { isPlanEditable } from 'src/plans/details/components/PlanStatus/utils/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { Alert, Flex, FlexItem, PageSection } from '@patternfly/react-core';

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
  const isFormInitialized = useRef(false);

  const { error, loaded, postHookResource, preHookResource, warning } = usePlanHooks(plan);

  const methods = useForm<HookFormValues>({
    defaultValues: getDefaultValues(postHookResource, preHookResource),
  });

  const { handleSubmit, reset } = methods;

  const resetToDefaultValues = useCallback(() => {
    reset(getDefaultValues(postHookResource, preHookResource));
  }, [reset, postHookResource, preHookResource]);

  // Only reset form on initial load
  useEffect(() => {
    if (loaded && !error && !isFormInitialized.current) {
      resetToDefaultValues();
      isFormInitialized.current = true;
    }
  }, [loaded, error, resetToDefaultValues]);

  const onSubmit = async (formData: HookFormValues) => {
    await onUpdatePlanHooks({
      formData,
      plan,
      postHookResource: postHookResource!,
      preHookResource: preHookResource!,
    });

    // Reset the form state to match the new server state
    reset(formData);
  };

  return (
    <FormProvider {...methods}>
      <LoadingSuspend obj={plan} loaded={loaded} loadError={error}>
        <PageSection hasBodyWrapper={false} className="pf-v6-u-h-100">
          <Flex
            direction={{ default: 'column' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            className="pf-v6-u-h-100"
          >
            <FlexItem>
              <SectionHeading
                text={
                  <TabTitle
                    title={t('Hooks')}
                    helpContent={t(
                      'Hooks are contained in Ansible playbooks that can be run before or after the migration. Hooks are applied to all virtual machines in the plan.',
                    )}
                  />
                }
              />
              {warning && (
                <Alert variant="warning" title={t('The plan hooks were manually configured')}>
                  <p>
                    {t('Warning:')} {warning},
                  </p>
                  <p>{t('updating the hooks will override the current configuration.')}</p>
                </Alert>
              )}

              <HooksCodeEditor type={hookTypes.PreHook} planEditable={isPlanEditable(plan)} />
              <HooksCodeEditor type={hookTypes.PostHook} planEditable={isPlanEditable(plan)} />
            </FlexItem>

            <FlexItem>
              <HooksTabActions
                onCancel={resetToDefaultValues}
                onUpdate={handleSubmit(onSubmit)}
                planEditable={isPlanEditable(plan)}
              />
            </FlexItem>
          </Flex>
        </PageSection>
      </LoadingSuspend>
    </FormProvider>
  );
};

export default PlanHooksPage;
