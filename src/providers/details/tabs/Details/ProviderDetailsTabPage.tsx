import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/providers/hooks/useProviderInventory';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';

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
    <>
      <DetailsSection data={data} />

      <UploadFilesSection data={data} />

      <SecretsSection data={data} />

      <InventorySection data={data} />

      <ConditionsSection conditions={provider?.status?.conditions} />
    </>
  );
};

export default ProviderDetailsTabPage;
