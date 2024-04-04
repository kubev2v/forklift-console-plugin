import React from 'react';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { PageHeadings } from 'src/modules/Providers/utils';

import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import PlanCriticalCondition from './PlanCriticalCondition';

export const PlanPageHeadings: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [plan, loaded, error] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const alerts = [];

  const criticalCondition =
    loaded &&
    !error &&
    plan?.status?.conditions?.find((condition) => condition?.category === 'Critical');

  if (criticalCondition) {
    alerts.push(
      <PlanCriticalCondition
        type={criticalCondition?.type}
        message={criticalCondition?.message}
        key={'providerCriticalCondition'}
      />,
    );
  }

  return (
    <>
      <PageHeadings
        model={PlanModel}
        obj={plan}
        namespace={namespace}
        actions={<PlanActionsDropdown data={{ obj: plan, permissions }} fieldId={''} fields={[]} />}
      >
        {alerts && alerts.length > 0 && (
          <PageSection variant="light" className="forklift-page-headings-alerts">
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};
