import { ProviderModelRef, type V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';

// return a URL for providers derails page
export const getProviderDetailsPageUrl = (provider: V1beta1Provider | undefined) => {
  return getResourceUrl({
    name: getName(provider),
    namespace: getNamespace(provider),
    reference: ProviderModelRef,
  });
};
