import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HookModelGroupVersionKind, V1beta1Hook, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { PlanDetailsTabProps } from '../../PlanDetailsPage';

import { PlanHooksSection } from './PlanHooksSection';

export type PlanHooksInitSectionProps = {
  plan: V1beta1Plan;
  loaded: boolean;
  loadError: unknown;
};

export const PlanHooks: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <div>
        <PageSection variant="light">
          <SectionHeading text={t('Hooks')} />
          <PlanHooksInitSection plan={plan} loaded={loaded} loadError={loadError} />
        </PageSection>
      </div>
    </>
  );
};

const PlanHooksInitSection: React.FC<PlanHooksInitSectionProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { plan } = props;

  // Retrieve all k8s Hooks
  const [hooks, hooksLoaded, hooksLoadError] = useK8sWatchResource<V1beta1Hook[]>({
    groupVersionKind: HookModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan.metadata?.namespace,
  });

  if (!hooksLoaded)
    return (
      <div>
        <span className="text-muted">{t('Hooks data is loading, please wait.')}</span>
      </div>
    );

  if (hooksLoadError)
    return (
      <div>
        <span className="text-muted">
          {t(
            'Something is wrong, the hooks data was not loaded due to an error, please try to reload the page.',
          )}
        </span>
      </div>
    );

  /*
  // Search for the Plan k8s Hooks
  const planHooks =
    hooks?.filter((hook) =>
      plan?.spec?.vms?.find((vm) =>
        vm.hooks?.find(
          (VMHook) =>
            VMHook.hook.name === hook.metadata?.name &&
            VMHook.hook.namespace === hook.metadata?.namespace,
        ),
      ),
    ) || [];
   */

  return <PlanHooksSection plan={plan} hooks={hooks || []} />;
};
