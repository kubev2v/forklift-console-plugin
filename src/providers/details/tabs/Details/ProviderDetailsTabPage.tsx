import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { type ProviderInventory, ProviderModel } from '@kubev2v/types';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import ConditionsSection from './components/ConditionsSection/ConditionsSection';
import DetailsSection from './components/DetailsSection/DetailsSection';
import UploadFilesSection from './components/DetailsSection/UploadFilesSection';
import InventorySection from './components/InventorySection/InventorySection';
import SecretsSection from './components/SecretsSection/SecretsSection';

const ProviderDetailsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { provider } = useProvider(name, namespace);

  const { inventory } = useProviderInventory<ProviderInventory>({ provider });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { inventory: inventory ?? undefined, permissions, provider };

  return (
    <ModalHOC>
      <DetailsSection data={data} />

      <UploadFilesSection data={data} />

      <SecretsSection data={data} />

      <InventorySection data={data} />

      <ConditionsSection conditions={provider?.status?.conditions} />
    </ModalHOC>
  );
};

export default ProviderDetailsTabPage;
