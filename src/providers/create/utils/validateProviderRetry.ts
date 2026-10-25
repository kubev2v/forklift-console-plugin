import type { V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace, getType, getUrl } from '@utils/crds/common/selectors';
import { hasObjectChangedInGivenFields } from '@utils/helpers/hasObjectChangedInGivenFields';

import type { ProviderCreationProgress, ProviderResources } from './providerCreation.types';

const getProviderIdentity = (provider: V1beta1Provider): object => ({
  name: getName(provider),
  namespace: getNamespace(provider),
  type: getType(provider),
  url: getUrl(provider),
});

const getCredentialResources = ({ provider, secret }: ProviderResources): object => ({
  provider: getProviderIdentity(provider),
  secret,
});

export const validateProviderRetry = (
  requested: ProviderResources,
  { provider, resources, secret }: ProviderCreationProgress,
): void => {
  if (provider) {
    if (
      hasObjectChangedInGivenFields({
        fieldsToAvoidComparing: [],
        newObject: requested,
        oldObject: resources,
      })
    ) {
      throw new Error('Provider already exists. Retry with the original settings.');
    }
    return;
  }

  if (
    secret &&
    hasObjectChangedInGivenFields({
      fieldsToAvoidComparing: [],
      newObject: getCredentialResources(requested),
      oldObject: resources && getCredentialResources(resources),
    })
  ) {
    throw new Error('Credentials and Provider identity cannot change after Secret creation.');
  }
};
