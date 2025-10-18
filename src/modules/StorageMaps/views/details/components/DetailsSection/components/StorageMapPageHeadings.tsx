import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import { StorageMapActionsDropdown } from 'src/modules/StorageMaps/actions/StorageMapActionsDropdown';
import StorageMapCriticalConditions from 'src/modules/StorageMaps/components/StorageMapCriticalConditions';

import {
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import { CATEGORY_TYPES } from '@utils/constants.ts';
import { isEmpty } from '@utils/helpers';

export const StorageMapPageHeadings: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: StorageMapModel,
    namespace,
  });

  const alerts = [];

  const criticalCondition =
    loaded &&
    !loadError &&
    obj?.status?.conditions?.find((condition) => condition?.category === CATEGORY_TYPES.CRITICAL);

  if (criticalCondition) {
    alerts.push(
      <StorageMapCriticalConditions
        type={criticalCondition?.type}
        message={criticalCondition?.message ?? ''}
        key={'mapCriticalCondition'}
      />,
    );
  }

  return (
    <>
      <PageHeadings
        model={StorageMapModel}
        obj={obj}
        namespace={namespace}
        actions={<StorageMapActionsDropdown data={{ obj, permissions }} fieldId={''} fields={[]} />}
      >
        {!isEmpty(alerts) && (
          <PageSection hasBodyWrapper={false} className="forklift-page-headings-alerts">
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};
