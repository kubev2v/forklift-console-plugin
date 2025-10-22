import { esxiSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/esxiSecretValidator';
import { openshiftSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/openshiftSecretValidator';
import { openstackSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/openstackSecretValidator';
import { ovirtSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/ovirtSecretValidator';
import { vcenterSecretValidator } from 'src/providers/details/tabs/Credentials/components/utils/vcenterSecretValidator';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export type SecretSubType = 'esxi' | 'vcenter';

export const secretValidator = (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
): ValidationMsg => {
  const type = provider?.spec?.type ?? '';
  const subTypeString = provider?.spec?.settings?.sdkEndpoint ?? '';
  const subType = subTypeString === 'esxi' ? 'esxi' : 'vcenter';

  switch (type) {
    case PROVIDER_TYPES.openshift:
      return openshiftSecretValidator(secret, provider);
    case PROVIDER_TYPES.openstack:
      return openstackSecretValidator(secret);
    case PROVIDER_TYPES.ovirt:
      return ovirtSecretValidator(secret);
    case PROVIDER_TYPES.vsphere:
      if (subType === 'esxi') {
        return esxiSecretValidator(secret);
      }
      return vcenterSecretValidator(secret);
    case PROVIDER_TYPES.ova:
      return { type: ValidationState.Default };
    default:
      return { msg: 'bad provider type', type: ValidationState.Error };
  }
};
