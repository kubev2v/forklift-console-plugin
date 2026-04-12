import { type FC, useState } from 'react';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { validateAapToken } from 'src/plans/create/steps/migration-hooks/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import {
  Button,
  ButtonVariant,
  FormGroup,
  FormHelperText,
  InputGroup,
  InputGroupItem,
  Label,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';

type AapTokenEditFieldProps = {
  control: Control<HookEditFormValues>;
  existingSecretName: string | undefined;
};

const AapTokenEditField: FC<AapTokenEditFieldProps> = ({ control, existingSecretName }) => {
  const { t } = useForkliftTranslation();
  const [tokenHidden, setTokenHidden] = useState(true);
  const [showTokenInput, setShowTokenInput] = useState(false);

  const hasExistingToken = Boolean(existingSecretName);

  if (hasExistingToken && !showTokenInput) {
    return (
      <FormGroup label={t('AAP Token')} fieldId={HookField.AapToken}>
        <Label color="green" data-testid="hook-edit-existing-token-label">
          {t('Token secret: {{name}}', { name: existingSecretName })}
        </Label>
        <FormHelperText>
          {t('A token is already saved.')}{' '}
          <Button
            variant={ButtonVariant.link}
            isInline
            onClick={() => {
              setShowTokenInput(true);
            }}
            data-testid="hook-edit-change-token-button"
          >
            {t('Change token')}
          </Button>
        </FormHelperText>
      </FormGroup>
    );
  }

  return (
    <Controller
      control={control}
      name={HookField.AapToken}
      rules={{
        validate: (value: string | undefined) =>
          hasExistingToken ? undefined : validateAapToken(value ?? ''),
      }}
      render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
        <FormGroupWithErrorText
          label={t('AAP Token')}
          isRequired={!hasExistingToken}
          fieldId={HookField.AapToken}
        >
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                onChange={onChange}
                value={value ?? ''}
                type={tokenHidden ? 'password' : 'text'}
                validated={getInputValidated(fieldError)}
                data-testid="hook-edit-aap-token-input"
                aria-label={t('AAP Token input')}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant={ButtonVariant.control}
                onClick={() => {
                  setTokenHidden((prev) => !prev);
                }}
                aria-label={tokenHidden ? t('Show token') : t('Hide token')}
                data-testid="hook-edit-aap-token-toggle"
              >
                {tokenHidden ? <EyeIcon /> : <EyeSlashIcon />}
              </Button>
            </InputGroupItem>
          </InputGroup>
          {!fieldError && (
            <FormHelperText>
              {hasExistingToken
                ? t('Enter a new token to replace the existing one.')
                : t(
                    'Personal access token for AAP authentication. Stored securely as a Kubernetes Secret.',
                  )}
            </FormHelperText>
          )}
        </FormGroupWithErrorText>
      )}
    />
  );
};

export default AapTokenEditField;
