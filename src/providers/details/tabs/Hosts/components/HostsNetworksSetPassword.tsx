import { type Dispatch, type FC, type FormEvent, type SetStateAction, useState } from 'react';
import { validateNoSpaces } from 'src/utils/validation/common';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';
import { ValidationState, type ValidationStateType } from '@utils/validation/Validation';

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

  const togglePasswordHidden = (): void => {
    setPasswordHidden((isHidden) => !isHidden);
  };

  return (
    <FormGroupWithHelpText
      fieldId="password"
      helperText={t('The password for the ESXi host admin')}
      helperTextInvalid={t('Invalid password')}
      isRequired
      label={t('ESXi host admin password')}
      validated={passwordValidation}
    >
      <InputGroup>
        <TextInput
          aria-label="Password input"
          className="forklift-host-modal-input-secret"
          isRequired
          onChange={onChangePassword}
          spellCheck="false"
          type={passwordHidden ? 'password' : 'text'}
          validated={passwordValidation}
          value={password}
        />
        <Button onClick={togglePasswordHidden} variant={ButtonVariant.control}>
          {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </InputGroup>
    </FormGroupWithHelpText>
  );
};

export default HostsNetworksSetPassword;
