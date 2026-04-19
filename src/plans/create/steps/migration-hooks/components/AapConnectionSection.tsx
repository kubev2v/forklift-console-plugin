import { type FC, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import {
  Button,
  ButtonVariant,
  FormGroup,
  FormHelperText,
  InputGroup,
  InputGroupItem,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import { useCreatePlanFormContext } from '../../../hooks/useCreatePlanFormContext';
import { AAP_CONNECTION_STATUS_CONNECTED, AAP_URL_PLACEHOLDER, AapFormFieldId } from '../constants';
import useAapConnection from '../hooks/useAapConnection';
import { validateAapToken, validateAapUrl } from '../utils';

import AapTimeoutField from './AapTimeoutField';
import ConnectionStatusAlert from './ConnectionStatusAlert';

type AapConnectionSectionProps = {
  onConnected: (jobTemplates: AapJobTemplate[]) => void;
};

const AapConnectionSection: FC<AapConnectionSectionProps> = ({ onConnected }) => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const [tokenHidden, setTokenHidden] = useState(true);

  const [aapUrl, aapToken] = useWatch({
    control,
    name: [AapFormFieldId.AapUrl, AapFormFieldId.AapToken],
  });

  const { connect, error, isConnecting, jobTemplates, status } = useAapConnection(
    aapUrl ?? '',
    aapToken ?? '',
  );

  const handleConnect = async (): Promise<void> => {
    const result = await connect();

    if (result?.status === AAP_CONNECTION_STATUS_CONNECTED) {
      onConnected(result.templates);
    }
  };

  const hasUrlError = Boolean(validateAapUrl(aapUrl ?? ''));
  const isConnectDisabled = hasUrlError || !aapToken?.trim() || isConnecting;

  return (
    <>
      <Controller
        control={control}
        name={AapFormFieldId.AapUrl}
        rules={{ validate: validateAapUrl }}
        render={({ field, fieldState: { error: fieldError } }) => (
          <FormGroupWithErrorText label={t('AAP URL')} isRequired fieldId={AapFormFieldId.AapUrl}>
            <TextInput
              {...field}
              id={AapFormFieldId.AapUrl}
              data-testid="aap-url-input"
              placeholder={AAP_URL_PLACEHOLDER}
              validated={getInputValidated(fieldError)}
            />
            {!fieldError && (
              <FormHelperText>
                {t('URL of your Ansible Automation Platform instance')}
              </FormHelperText>
            )}
          </FormGroupWithErrorText>
        )}
      />

      <Controller
        control={control}
        name={AapFormFieldId.AapToken}
        rules={{ validate: validateAapToken }}
        render={({ field, fieldState: { error: fieldError } }) => (
          <FormGroupWithErrorText
            label={t('AAP Token')}
            isRequired
            fieldId={AapFormFieldId.AapToken}
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  {...field}
                  id={AapFormFieldId.AapToken}
                  data-testid="aap-token-input"
                  type={tokenHidden ? 'password' : 'text'}
                  validated={getInputValidated(fieldError)}
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
                  data-testid="aap-token-toggle"
                >
                  {tokenHidden ? <EyeIcon /> : <EyeSlashIcon />}
                </Button>
              </InputGroupItem>
            </InputGroup>
            {!fieldError && (
              <FormHelperText>
                {t(
                  'Personal access token for AAP authentication. Stored securely as a Kubernetes Secret.',
                )}
              </FormHelperText>
            )}
          </FormGroupWithErrorText>
        )}
      />

      <AapTimeoutField />

      <FormGroup fieldId="aap-connect-action">
        <Button
          variant={ButtonVariant.primary}
          onClick={handleConnect}
          isDisabled={isConnectDisabled}
          isLoading={isConnecting}
          data-testid="aap-connect-button"
        >
          {isConnecting ? t('Connecting...') : t('Connect to AAP')}
        </Button>
      </FormGroup>

      <ConnectionStatusAlert status={status} error={error} templateCount={jobTemplates.length} />
    </>
  );
};

export default AapConnectionSection;
