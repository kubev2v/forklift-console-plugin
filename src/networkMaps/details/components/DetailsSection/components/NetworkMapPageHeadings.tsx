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
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

export const NetworkMapPageHeadings: FC<{ name: string; namespace?: string }> = ({
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
      actions={
        <Flex
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <FlexItem>
            <LearningExperienceButton />
          </FlexItem>
          <FlexItem>
            <NetworkMapActionsDropdown data={{ obj, permissions }} fieldId={''} fields={[]} />
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
  );
};
