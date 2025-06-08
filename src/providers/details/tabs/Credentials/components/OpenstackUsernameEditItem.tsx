import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TextInput } from '@patternfly/react-core';

import type { onChangeFactoryType } from './utils/types';

type OpenstackUsernameEditItemProps = {
  usernameValidation: ValidationMsg;
  username: string | undefined;
  onChangeFactory: onChangeFactoryType;
};

const OpenstackUsernameEditItem: FC<OpenstackUsernameEditItemProps> = ({
  onChangeFactory,
  username,
  usernameValidation,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      label={t('Username')}
      isRequired
      fieldId={OpenstackSecretFieldsId.Username}
      helperText={usernameValidation.msg}
      helperTextInvalid={usernameValidation.msg}
      validated={usernameValidation.type}
    >
      <TextInput
        spellCheck="false"
        isRequired
        type="text"
        id={OpenstackSecretFieldsId.Username}
        name={OpenstackSecretFieldsId.Username}
        value={username}
        onChange={onChangeFactory(OpenstackSecretFieldsId.Username)}
        validated={usernameValidation.type}
      />
    </FormGroupWithHelpText>
  );
};

export default OpenstackUsernameEditItem;
