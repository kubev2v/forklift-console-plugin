import { V1beta1Provider } from '@kubev2v/types';

import { openshiftProviderValidator } from './openshiftProviderValidator';
import { openstackProviderValidator } from './openstackProviderValidator';
import { ovaProviderValidator } from './ovaProviderValidator';
import { ovirtProviderValidator } from './ovirtProviderValidator';
import { vsphereProviderValidator } from './vsphereProviderValidator';

export function providerValidator(provider: V1beta1Provider) {
  let validationError = null;

  switch (provider.spec.type) {
    case 'openshift':
      validationError = openshiftProviderValidator(provider);
      break;
    case 'openstack':
      validationError = openstackProviderValidator(provider);
      break;
    case 'ovirt':
      validationError = ovirtProviderValidator(provider);
      break;
    case 'vsphere':
      validationError = vsphereProviderValidator(provider);
      break;
    case 'ova':
      validationError = ovaProviderValidator(provider);
      break;
    default:
      validationError = new Error('bad provider type');
  }

  return validationError;
}
