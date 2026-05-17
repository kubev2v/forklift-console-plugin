import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import InspectVirtualMachinesButton from 'src/components/InspectVirtualMachines/InspectVirtualMachinesButton';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import { type ProviderInventory, ProviderModel } from '@forklift-ui/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import CreatePlanAction from './components/CreatePlanAction';
import ProviderPageHeaderAlerts from './components/ProviderPageHeaderAlerts';
import { useCanInspectProvider } from './hooks/useCanInspectProvider';
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
  const { canInspect, disabledReason, isVsphere } = useCanInspectProvider(provider);

  return (
    <PageHeadings
      model={ProviderModel}
      obj={provider}
      namespace={namespace}
      testId="resource-details-title"
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
            <CreatePlanAction namespace={namespace} provider={provider} />
          </FlexItem>
          {isVsphere && provider && (
            <FlexItem>
              <InspectVirtualMachinesButton
                canInspect={canInspect}
                disabledReason={disabledReason}
                provider={provider}
                testId="provider-inspect-vms-button"
              />
            </FlexItem>
          )}
          <FlexItem>
            <ProviderActionsDropdown data={data} />
          </FlexItem>
        </Flex>
      }
    >
      <ProviderPageHeaderAlerts
        provider={provider}
        inventoryLoading={inventoryLoading}
        inventoryError={inventoryError}
      />
    </PageHeadings>
  );
};

export default ProviderPageHeader;
