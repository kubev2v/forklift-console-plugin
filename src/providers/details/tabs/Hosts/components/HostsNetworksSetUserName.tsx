import { type Dispatch, type FC, type FormEvent, type SetStateAction, useState } from 'react';
import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { ValidationState, type ValidationStateType } from 'src/providers/utils/types';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type HostsNetworksSetUserNameProps = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
};

const HostsNetworksSetUserName: FC<HostsNetworksSetUserNameProps> = ({ setUsername, username }) => {
  const { t } = useForkliftTranslation();

  const [usernameValidation, setUsernameValidation] = useState<ValidationStateType>(
    ValidationState.Default,
  );

  const onChangeUser: (_event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    const isValidUsername = validateNoSpaces(value);
    setUsernameValidation(isValidUsername ? ValidationState.Success : ValidationState.Error);
    setUsername(value);
  };

  return (
    <FormGroupWithHelpText
      label={t('ESXi host admin username')}
      isRequired
      fieldId="username"
      helperText={t('The username for the ESXi host admin')}
      helperTextInvalid={t('Invalid username')}
      validated={usernameValidation}
    >
      <TextInput
        spellCheck="false"
        isRequired
        type="text"
        id="username"
        value={username}
        onChange={onChangeUser}
        validated={usernameValidation}
      />
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSetUserName;
