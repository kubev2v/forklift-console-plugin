import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ProviderModelRef, type V1beta1Provider } from '@kubev2v/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';

// return a URL for providers derails page
export const getProviderDetailsPageUrl = (provider: V1beta1Provider | undefined) => {
  return getResourceUrl({
    name: getName(provider),
    namespace: getNamespace(provider),
    reference: ProviderModelRef,
  });
};
