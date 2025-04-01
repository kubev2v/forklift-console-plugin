import { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { openshiftProviderValidator } from './openshift/openshiftProviderValidator';
import { openstackProviderValidator } from './openstack/openstackProviderValidator';
import { ovaProviderValidator } from './ova/ovaProviderValidator';
import { ovirtProviderValidator } from './ovirt/ovirtProviderValidator';
import { vsphereProviderValidator } from './vsphere/vsphereProviderValidator';
import { ValidationMsg } from '../common';
import { SecretSubType } from './secretValidator';

export function providerValidator(
  provider: V1beta1Provider,
  subType: SecretSubType,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg {
  let validationError: ValidationMsg;

  switch (provider.spec.type) {
    case 'openshift':
      validationError = openshiftProviderValidator(provider, secret);
      break;
    case 'openstack':
      validationError = openstackProviderValidator(provider);
      break;
    case 'ovirt':
      validationError = ovirtProviderValidator(provider);
      break;
    case 'vsphere':
      validationError = vsphereProviderValidator(provider, subType, secret);
      break;
    case 'ova':
      validationError = ovaProviderValidator(provider);
      break;
    default:
      validationError = { type: 'error', msg: 'unknown provider type' };
  }

  return validationError;
}
