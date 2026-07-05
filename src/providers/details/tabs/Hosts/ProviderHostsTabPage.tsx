import type { FC } from 'react';
import { isHypervClusterProvider } from 'src/providers/utils/helpers/isHypervClusterProvider';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';

import { ProviderModel } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import HypervHostsList from './components/HypervHostsList';
import VSphereHostsList from './components/VSphereHostsList';

const ProviderHostsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { provider } = useProvider(name, namespace);
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { permissions, provider };

  if (provider?.spec?.type === PROVIDER_TYPES.vsphere) {
    return <VSphereHostsList data={data} />;
  }

  if (isHypervClusterProvider(provider)) {
    return <HypervHostsList data={data} />;
  }

  return null;
};

export default ProviderHostsTabPage;
