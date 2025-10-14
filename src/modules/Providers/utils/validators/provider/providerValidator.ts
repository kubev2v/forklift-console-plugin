import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

import { openshiftProviderValidator } from './openshift/openshiftProviderValidator';
import { openstackProviderValidator } from './openstack/openstackProviderValidator';
import { ovaProviderValidator } from './ova/ovaProviderValidator';
import { ovirtProviderValidator } from './ovirt/ovirtProviderValidator';
import { vsphereProviderValidator } from './vsphere/vsphereProviderValidator';
import type { SecretSubType } from './secretValidator';

export const providerValidator = (
  provider: V1beta1Provider,
  subType: SecretSubType,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  switch (provider.spec?.type) {
    case PROVIDER_TYPES.openshift:
      return openshiftProviderValidator(provider, secret);
    case PROVIDER_TYPES.openstack:
      return openstackProviderValidator(provider);
    case PROVIDER_TYPES.ovirt:
      return ovirtProviderValidator(provider);
    case PROVIDER_TYPES.vsphere:
      return vsphereProviderValidator(provider, subType, secret);
    case PROVIDER_TYPES.ova:
      return ovaProviderValidator(provider);
    case undefined:
    default:
      return { msg: 'unknown provider type', type: ValidationState.Error };
  }
};
