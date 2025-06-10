import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';

import { type ProviderInventory, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';

import CreatePlanAction from './components/CreatePlanAction';
import ProviderPageHeaderAlerts from './components/ProviderPageHeaderAlerts';

type ProviderPageHeaderProps = {
  provider: V1beta1Provider;
};

const ProviderPageHeader: FC<ProviderPageHeaderProps> = ({ provider }) => {
  const namespace = getNamespace(provider);
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
