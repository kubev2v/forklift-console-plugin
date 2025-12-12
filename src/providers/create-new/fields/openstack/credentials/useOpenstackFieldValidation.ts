import { openstackSecretFieldValidator } from 'src/providers/details/tabs/Credentials/components/utils/openstackSecretFieldValidator';
import type { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { ValidationState } from '@utils/validation/Validation';

export const validateOpenstackField = (openstackFieldId: OpenstackSecretFieldsId) => {
  return (value: string | boolean | undefined): string | true => {
    const stringValue = typeof value === 'string' ? value : '';
    const result = openstackSecretFieldValidator(openstackFieldId, stringValue);

    if (result.type === ValidationState.Error && typeof result.msg === 'string') {
      return result.msg;
    }

    return true;
  };
};
