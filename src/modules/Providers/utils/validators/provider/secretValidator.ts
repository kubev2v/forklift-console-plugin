import { esxiSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/esxiSecretValidator';
import { openshiftSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/openshiftSecretValidator';
import { openstackSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/openstackSecretValidator';
import { ovirtSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/ovirtSecretValidator';
import { vcenterSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/vcenterSecretValidator';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import type { ValidationMsg } from '../common';

export type SecretSubType = 'esxi' | 'vcenter';

export const secretValidator = (
  provider: V1beta1Provider,
  type: string,
  subType: SecretSubType,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  let validationError: ValidationMsg;

  switch (type) {
    case 'openshift':
      validationError = openshiftSecretValidator(secret, provider);
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
      validationError = { msg: 'bad provider type', type: 'error' };
  }

  return validationError;
};
