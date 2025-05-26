import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ProviderModelRef, type V1beta1Provider } from '@kubev2v/types';
import { getName, getNamespace } from '@utils/crds/common/selectors';

export const getProviderURL = (provider: V1beta1Provider | undefined) =>
  getResourceUrl({
    name: getName(provider),
    namespace: getNamespace(provider),
    reference: ProviderModelRef,
  });
