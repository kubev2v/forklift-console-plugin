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
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { CATEGORY_TYPES } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

export const StorageMapPageHeadings: FC<{ name: string; namespace?: string }> = ({
  name,
  namespace,
}) => {
  const [obj, loaded, loadError] = useTypedK8sWatchResource<V1beta1StorageMap>({
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
        key={'mapCriticalCondition'}
        message={criticalCondition?.message ?? ''}
        type={criticalCondition?.type}
      />,
    );
  }

  return (
    <>
      <PageHeadings
        actions={
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            direction={{ default: 'row' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <LearningExperienceButton />
            </FlexItem>
            <FlexItem>
              <StorageMapActionsDropdown
                data={{ obj, permissions }}
                fieldId={''}
                fields={[]}
                isDetailsPage
              />
            </FlexItem>
          </Flex>
        }
        model={StorageMapModel}
        namespace={namespace}
        obj={obj}
      >
        {!isEmpty(alerts) && (
          <PageSection className="forklift-page-headings-alerts" hasBodyWrapper={false}>
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};
