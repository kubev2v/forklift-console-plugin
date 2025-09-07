import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';

import { type ProviderInventory, ProviderModel } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';

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
      model={ProviderModel}
      obj={provider}
      namespace={namespace}
      testId="resource-details-title"
      actions={
        <Split hasGutter>
          <SplitItem>
            <CreatePlanAction namespace={namespace} provider={provider} />
          </SplitItem>

          <SplitItem>
            <ProviderActionsDropdown data={data} />
          </SplitItem>
        </Split>
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
