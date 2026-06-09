import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import { ProviderModel } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

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
