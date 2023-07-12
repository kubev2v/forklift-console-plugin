import { V1Secret } from '@kubev2v/types';

import { openshiftSecretValidator } from './openshiftSecretValidator';
import { openstackSecretValidator } from './openstackSecretValidator';
import { ovirtSecretValidator } from './ovirtSecretValidator';
import { vsphereSecretValidator } from './vsphereSecretValidator';

export function secretValidator(type: string, secret: V1Secret) {
  let validationError = null;

  switch (type) {
    case 'openshift':
      validationError = openshiftSecretValidator(secret);
      break;
    case 'openstack':
      validationError = openstackSecretValidator(secret);
      break;
    case 'ovirt':
      validationError = ovirtSecretValidator(secret);
      break;
    case 'vsphere':
      validationError = vsphereSecretValidator(secret);
      break;
    case 'ova':
      validationError = null;
      break;
    default:
      validationError = new Error('bad provider type');
  }

  return validationError;
}
