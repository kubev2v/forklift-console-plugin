import type { FC } from 'react';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { ProviderModel, type V1beta1Provider } from '@kubev2v/types';

import VSphereHostsList from './components/VSphereHostsList';

type ProviderHostsTabPageProp = {
  provider: V1beta1Provider;
};

const ProviderHostsTabPage: FC<ProviderHostsTabPageProp> = ({ provider }) => {
  const namespace = provider?.metadata?.namespace;
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { permissions, provider };

  return (
    <ModalHOC>
      {provider?.spec?.type === PROVIDER_TYPES.vsphere && <VSphereHostsList data={data} />}
    </ModalHOC>
  );
};

export default ProviderHostsTabPage;
