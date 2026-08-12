import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import { type ProviderInventory, ProviderModel } from '@forklift-ui/types';
import { Flex, FlexItem } from '@patternfly/react-core';
import type { ProviderData } from '@utils/providers/types';

import CreatePlanAction from './components/CreatePlanAction';
import ProviderPageHeaderAlerts from './components/ProviderPageHeaderAlerts';
import { useProvider } from './hooks/useProvider';
import type { ProviderDetailsPageProps } from './utils/types';

const ProviderPageHeader: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { provider } = useProvider(name, namespace);
  const {
    error: inventoryError,
    inventory,
    loading: inventoryLoading,
  } = useProviderInventory<ProviderInventory>({
    provider,
  });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { inventory: inventory ?? undefined, permissions, provider };

  return (
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
            <CreatePlanAction namespace={namespace} provider={provider} />
          </FlexItem>
          <FlexItem>
            <ProviderActionsDropdown data={data} isDetailsPage />
          </FlexItem>
        </Flex>
      }
      model={ProviderModel}
      namespace={namespace}
      obj={provider}
      testId="resource-details-title"
    >
      <ProviderPageHeaderAlerts
        inventoryError={inventoryError}
        inventoryLoading={inventoryLoading}
        provider={provider}
      />
    </PageHeadings>
  );
};

export default ProviderPageHeader;
