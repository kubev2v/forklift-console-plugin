import type { FC } from 'react';
import { NetworkMapActionsDropdown } from 'src/modules/NetworkMaps/actions/NetworkMapActionsDropdown';
import NetworkMapCriticalConditions from 'src/modules/NetworkMaps/components/NetworkMapCriticalConditions';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';

import {
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  type V1beta1NetworkMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

export const NetworkMapPageHeadings: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: NetworkMapModel,
    namespace,
  });

  const alerts = [];

  const criticalCondition =
    loaded &&
    !loadError &&
    obj?.status?.conditions?.find((condition) => condition?.category === 'Critical');

  if (criticalCondition) {
    alerts.push(
      <NetworkMapCriticalConditions
        type={criticalCondition?.type}
        message={criticalCondition?.message ?? ''}
        key={'mapCriticalCondition'}
      />,
    );
  }

  return (
    <PageHeadings
      model={{ ...NetworkMapModel, label: 'Network map' }}
      obj={obj}
      namespace={namespace}
      actions={<NetworkMapActionsDropdown data={{ obj, permissions }} fieldId={''} fields={[]} />}
    >
      {!isEmpty(alerts) && (
        <PageSection variant="light" className="forklift-page-headings-alerts">
          {alerts}
        </PageSection>
      )}
    </PageHeadings>
  );
};
