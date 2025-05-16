import { type Dispatch, type FC, type FormEvent, type SetStateAction, useState } from 'react';
import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import type { ValidationState } from './utils/types';

type HostsNetworksSetPasswordProps = {
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
};

const HostsNetworksSetPassword: FC<HostsNetworksSetPasswordProps> = ({ password, setPassword }) => {
  const { t } = useForkliftTranslation();

  const [passwordValidation, setPasswordValidation] = useState<ValidationState>('default');
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  const validatePassword = (passwd: string) => {
    return validateNoSpaces(passwd);
  };

  const onChangePassword: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    const isValidPassword = validatePassword(value);
    setPasswordValidation(isValidPassword ? 'success' : 'error');
    setPassword(value);
  };

  const togglePasswordHidden = () => {
    setPasswordHidden(!passwordHidden);
  };

  return (
    <FormGroupWithHelpText
      label="ESXi host admin password"
      isRequired
      fieldId="password"
      helperText={t('The password for the ESXi host admin')}
      helperTextInvalid={t('Invalid password')}
      validated={passwordValidation}
    >
      <InputGroup>
        <TextInput
          spellCheck="false"
          className="forklift-host-modal-input-secret"
          isRequired
          type={passwordHidden ? 'password' : 'text'}
          aria-label="Password input"
          value={password}
          onChange={(e, value) => {
            onChangePassword(value, e);
          }}
          validated={passwordValidation}
        />
        <Button variant="control" onClick={togglePasswordHidden}>
          {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </InputGroup>
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSetPassword;
