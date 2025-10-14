import { providerAndSecretValidator } from 'src/modules/Providers/utils/validators/provider/providerAndSecretValidator';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { getName } from '@utils/crds/common/selectors';
import { t } from '@utils/i18n';
import { type ValidationMsg, ValidationState } from '@utils/validation/Validation';

export const validateProviderAndSecret = (
  provider: V1beta1Provider,
  secret: IoK8sApiCoreV1Secret,
  providerNames: string[] | undefined,
): ValidationMsg => {
  if (!getName(provider)) {
    return {
      msg: t(`Missing provider name`),
      type: ValidationState.Error,
    };
  }
  if (providerNames?.includes(getName(provider)!)) {
    return {
      msg: t(`Provider name is not unique`),
      type: ValidationState.Error,
    };
  }

  return providerAndSecretValidator(provider, secret);
};
