import { type FC, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { validateK8sToken } from 'src/modules/Providers/utils/validators/common';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from './constants';

const ServiceAccountTokenField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();
  const [tokenHidden, setTokenHidden] = useState<boolean>(true);

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.ServiceAccountToken,
    rules: {
      required: t('Service account bearer token is required when connecting to a remote cluster'),
      validate: {
        validToken: async (val: string | undefined) => {
          if (!val || val.trim() === '') {
            return true;
          }

          const trimmedValue = val.trim();
          if (!validateK8sToken(trimmedValue)) {
            return t('Invalid token, a valid Kubernetes service account token is required');
          }

          return true;
        },
      },
    },
  });

  const onClickToggleToken = () => {
    setTokenHidden(!tokenHidden);
  };

  return (
    <FormGroupWithHelpText
      isRequired
      label={t('Service account bearer token')}
      fieldId={ProviderFormFieldId.ServiceAccountToken}
      validated={getInputValidated(error)}
      helperText={t(
        'A service account token used for authenticating the connection to the API server.',
      )}
      helperTextInvalid={error?.message}
    >
      <InputGroup>
        <TextInput
          id={ProviderFormFieldId.ServiceAccountToken}
          type={tokenHidden ? 'password' : 'text'}
          value={value ?? ''}
          onChange={(_event, val) => {
            onChange(val);
          }}
          validated={getInputValidated(error)}
          data-testid="service-account-token-input"
          spellCheck="false"
          aria-label="Service account bearer token"
        />
        <Button
          variant={ButtonVariant.control}
          onClick={onClickToggleToken}
          aria-label={tokenHidden ? t('Show token') : t('Hide token')}
        >
          {tokenHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </InputGroup>
    </FormGroupWithHelpText>
  );
};

export default ServiceAccountTokenField;
