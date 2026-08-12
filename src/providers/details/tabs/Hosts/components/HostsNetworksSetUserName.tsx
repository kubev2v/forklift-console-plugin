import { type Dispatch, type FC, type FormEvent, type SetStateAction, useState } from 'react';
import { validateNoSpaces } from 'src/utils/validation/common';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState, type ValidationStateType } from '@utils/validation/Validation';

type HostsNetworksSetUserNameProps = {
  setUsername: Dispatch<SetStateAction<string>>;
  username: string;
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
      fieldId="username"
      helperText={t('The username for the ESXi host admin')}
      helperTextInvalid={t('Invalid username')}
      isRequired
      label={t('ESXi host admin username')}
      validated={usernameValidation}
    >
      <TextInput
        id="username"
        isRequired
        onChange={onChangeUser}
        spellCheck="false"
        type="text"
        validated={usernameValidation}
        value={username}
      />
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSetUserName;
