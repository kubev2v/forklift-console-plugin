import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import NetworkMapActionsDropdown from 'src/networkMaps/actions/NetworkMapActionsDropdown';
import NetworkMapCriticalConditions from 'src/networkMaps/components/NetworkMapCriticalConditions';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import {
  NetworkMapModel,
  NetworkMapModelGroupVersionKind,
  type V1beta1NetworkMap,
} from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';

export const NetworkMapPageHeadings: FC<{ name: string; namespace?: string }> = ({
  name,
  namespace,
}) => {
  const [obj, loaded, loadError] = toTypedWatchResult(
    useK8sWatchResource<V1beta1NetworkMap>({
      groupVersionKind: NetworkMapModelGroupVersionKind,
      name,
      namespace,
      namespaced: true,
    }),
  );

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
        key={'mapCriticalCondition'}
        message={criticalCondition?.message ?? ''}
        type={criticalCondition?.type}
      />,
    );
  }

  return (
    <PageHeadings
      actions={
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          direction={{ default: 'row' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <FlexItem>
            <LearningExperienceButton />
          </FlexItem>
          <FlexItem>
            <NetworkMapActionsDropdown
              data={{ obj, permissions }}
              fieldId={''}
              fields={[]}
              isDetailsPage
            />
          </FlexItem>
        </Flex>
      }
      model={{ ...NetworkMapModel, label: 'Network map' }}
      namespace={namespace}
      obj={obj}
    >
      {!isEmpty(alerts) && (
        <PageSection className="forklift-page-headings-alerts" hasBodyWrapper={false}>
          {alerts}
        </PageSection>
      )}
    </PageHeadings>
  );
};
