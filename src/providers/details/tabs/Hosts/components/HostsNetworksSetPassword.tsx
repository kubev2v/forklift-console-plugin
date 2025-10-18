import { type Dispatch, type FC, type FormEvent, type SetStateAction, useState } from 'react';
import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { ValidationState, type ValidationStateType } from 'src/providers/utils/types';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type HostsNetworksSetPasswordProps = {
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
};

const HostsNetworksSetPassword: FC<HostsNetworksSetPasswordProps> = ({ password, setPassword }) => {
  const { t } = useForkliftTranslation();

  const [passwordValidation, setPasswordValidation] = useState<ValidationStateType>(
    ValidationState.Default,
  );
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  const onChangePassword: (_event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    const isValidPassword = validateNoSpaces(value);
    setPasswordValidation(isValidPassword ? ValidationState.Success : ValidationState.Error);
    setPassword(value);
  };

  const togglePasswordHidden = () => {
    setPasswordHidden((isHidden) => !isHidden);
  };

  return (
    <FormGroupWithHelpText
      label={t('ESXi host admin password')}
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
          onChange={onChangePassword}
          validated={passwordValidation}
        />
        <Button variant={ButtonVariant.control} onClick={togglePasswordHidden}>
          {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </InputGroup>
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSetPassword;
