import type { V1beta1Provider } from '@forklift-ui/types';
import { getName, getNamespace, getType, getUrl } from '@utils/crds/common/selectors';
import { hasObjectChangedInGivenFields } from '@utils/helpers/hasObjectChangedInGivenFields';
import { t } from '@utils/i18n';

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

export const providerCredentialsChanged = (
  requested: ProviderResources,
  previous: ProviderResources | undefined,
): boolean =>
  hasObjectChangedInGivenFields({
    fieldsToAvoidComparing: [],
    newObject: getCredentialResources(requested),
    oldObject: previous && getCredentialResources(previous),
  });

export const validateProviderRetry = (
  requested: ProviderResources,
  { provider, resources }: ProviderCreationProgress,
): void => {
  if (
    provider &&
    hasObjectChangedInGivenFields({
      fieldsToAvoidComparing: [],
      newObject: requested,
      oldObject: resources,
    })
  ) {
    throw new Error(t('Provider already exists. Retry with the original settings.'));
  }
};
