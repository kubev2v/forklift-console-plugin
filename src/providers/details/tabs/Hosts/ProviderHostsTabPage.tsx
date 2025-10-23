import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { ProviderModel } from '@kubev2v/types';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import VSphereHostsList from './components/VSphereHostsList';

const ProviderHostsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { provider } = useProvider(name, namespace);
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { permissions, provider };

  return provider?.spec?.type === PROVIDER_TYPES.vsphere ? <VSphereHostsList data={data} /> : null;
};

export default ProviderHostsTabPage;
