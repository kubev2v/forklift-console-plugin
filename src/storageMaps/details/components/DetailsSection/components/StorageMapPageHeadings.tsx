import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import { StorageMapActionsDropdown } from 'src/storageMaps/actions/StorageMapActionsDropdown';
import StorageMapCriticalConditions from 'src/storageMaps/components/StorageMapCriticalConditions';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import {
  StorageMapModel,
  StorageMapModelGroupVersionKind,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { CATEGORY_TYPES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

export const StorageMapPageHeadings: FC<{ name: string; namespace?: string }> = ({
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
        actions={
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <LearningExperienceButton />
            </FlexItem>
            <FlexItem>
              <StorageMapActionsDropdown data={{ obj, permissions }} fieldId={''} fields={[]} />
            </FlexItem>
          </Flex>
        }
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
