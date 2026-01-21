import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

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
