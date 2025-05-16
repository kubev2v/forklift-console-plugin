import { type Dispatch, type FC, type FormEvent, type SetStateAction, useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { ValidationState } from './utils/types';
import { validateUsername } from './utils/validators';

type HostsNetworksSetUserNameProps = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
};

const HostsNetworksSetUserName: FC<HostsNetworksSetUserNameProps> = ({ setUsername, username }) => {
  const { t } = useForkliftTranslation();

  const [usernameValidation, setUsernameValidation] = useState<ValidationState>('default');

  const onChangeUser: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    const isValidUsername = validateUsername(value);
    setUsernameValidation(isValidUsername ? 'success' : 'error');
    setUsername(value);
  };

  return (
    <FormGroupWithHelpText
      label="ESXi host admin username"
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
        onChange={(e, value) => {
          onChangeUser(value, e);
        }}
        validated={usernameValidation}
      />
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSetUserName;
