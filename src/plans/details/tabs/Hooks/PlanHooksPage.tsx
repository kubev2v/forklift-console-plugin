import type { FC } from 'react';
import TabTitle from 'src/overview/components/TabTitle';

import SectionHeading from '@components/headers/SectionHeading';
import LoadingSuspend from '@components/LoadingSuspend';
import { Alert, Flex, PageSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import HookSection from './components/HookSection/HookSection';
import { usePlanHooks } from './hooks/usePlanHooks';
import { hookTypes } from './utils/constants';

const PlanHooksPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const { loaded: loadedPlan, loadError: planError, plan } = usePlan(name, namespace);
  const {
    error: hooksError,
    loaded: loadedHooks,
    postHookResource,
    preHookResource,
    warning,
  } = usePlanHooks(plan);

  return (
    <LoadingSuspend
      loaded={loadedPlan && loadedHooks}
      loadError={planError ?? hooksError}
      obj={plan}
    >
      <PageSection className="pf-v6-u-h-100" hasBodyWrapper={false}>
        <Flex direction={{ default: 'column' }}>
          <SectionHeading
            className="pf-v6-u-mb-0"
            text={
              <TabTitle
                helpContent={t(
                  'Hooks are contained in Ansible playbooks that can be run before or after the migration. Hooks are applied to all virtual machines in the plan.',
                )}
                title={t('Hooks')}
              />
            }
          />
          {warning && (
            <Alert title={t('The plan hooks were manually configured')} variant="warning">
              <p>
                {t('Warning:')} {warning},
              </p>
              <p>{t('updating the hooks will override the current configuration.')}</p>
            </Alert>
          )}
          <HookSection
            hook={preHookResource}
            plan={plan}
            step={hookTypes.PreHook}
            title={t('Pre-migration hook')}
          />
          <HookSection
            hook={postHookResource}
            plan={plan}
            step={hookTypes.PostHook}
            title={t('Post-migration hook')}
          />
        </Flex>
      </PageSection>
    </LoadingSuspend>
  );
};

export default PlanHooksPage;
