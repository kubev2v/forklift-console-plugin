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
    case 'openshift':
      return openshiftProviderValidator(provider, secret);
    case 'openstack':
      return openstackProviderValidator(provider);
    case 'ovirt':
      return ovirtProviderValidator(provider);
    case 'vsphere':
      return vsphereProviderValidator(provider, subType, secret);
    case 'ova':
      return ovaProviderValidator(provider);
    case undefined:
    default:
      return { msg: 'unknown provider type', type: ValidationState.Error };
  }
};
