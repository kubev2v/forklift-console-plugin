import { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import { ValidationMsg } from '../common';

import { openshiftSecretValidator } from './openshift/openshiftSecretValidator';
import { openstackSecretValidator } from './openstack/openstackSecretValidator';
import { ovirtSecretValidator } from './ovirt/ovirtSecretValidator';
import { esxiSecretValidator, vcenterSecretValidator } from './vsphere';

export type SecretSubType = 'esxi' | 'vcenter';

export function secretValidator(
  type: string,
  subType: SecretSubType,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg {
  let validationError: ValidationMsg;

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
      if (subType === 'esxi') {
        validationError = esxiSecretValidator(secret);
      } else {
        validationError = vcenterSecretValidator(secret);
      }
      break;
    case 'ova':
      validationError = { type: 'default' };
      break;
    default:
      validationError = { type: 'error', msg: 'bad provider type' };
  }

  return validationError;
}
