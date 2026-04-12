import { type FC, useMemo, useState } from 'react';
import type { Control } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import ConnectionStatusAlert from 'src/plans/create/steps/migration-hooks/components/ConnectionStatusAlert';
import {
  AAP_CONNECTION_STATUS_CONNECTED,
  AAP_URL_PLACEHOLDER,
} from 'src/plans/create/steps/migration-hooks/constants';
import useAapConnection from 'src/plans/create/steps/migration-hooks/hooks/useAapConnection';
import { validateAapUrl } from 'src/plans/create/steps/migration-hooks/utils';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import {
  Button,
  ButtonVariant,
  FormGroup,
  FormHelperText,
  TextInput,
} from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';
import type { AapJobTemplate } from '@utils/types/aap';

import type { HookEditFormValues } from '../../state/types';
import { HookField } from '../../state/types';

import AapJobTemplateEditField from './AapJobTemplateEditField';
import AapTokenEditField from './AapTokenEditField';
const NUMERIC_ONLY_PATTERN = /^\d*$/u;

type AapHookEditFieldsProps = {
  control: Control<HookEditFormValues>;
};

const toSelectOptions = (templates: AapJobTemplate[]): TypeaheadSelectOption[] =>
  templates.map((tpl) => ({
    content: tpl.name,
    optionProps: { description: tpl.description },
    value: tpl.id,
  }));

const AapHookEditFields: FC<AapHookEditFieldsProps> = ({ control }) => {
  const { t } = useForkliftTranslation();
  const [templates, setTemplates] = useState<AapJobTemplate[]>([]);

  const [aapUrl, aapToken, existingSecretName] = useWatch({
    control,
    name: [HookField.AapUrl, HookField.AapToken, HookField.AapExistingTokenSecretName],
  });

  const tokenValue = String(aapToken ?? '');
  const hasExistingToken = Boolean(existingSecretName);

  const { connect, error, isConnecting, status } = useAapConnection(
    String(aapUrl ?? ''),
    hasExistingToken && !tokenValue.trim() ? 'placeholder' : tokenValue,
  );

  const handleConnect = async (): Promise<void> => {
    const result = await connect();
    if (result?.status === AAP_CONNECTION_STATUS_CONNECTED) {
      setTemplates(result.templates);
    }
  };

  const hasUrlError = Boolean(validateAapUrl(String(aapUrl ?? '')));
  const isConnectDisabled =
    hasUrlError || (!hasExistingToken && !tokenValue.trim()) || isConnecting;
  const templateOptions = useMemo(() => toSelectOptions(templates), [templates]);

  return (
    <>
      <Controller
        control={control}
        name={HookField.AapUrl}
        rules={{ validate: (value: string | undefined) => validateAapUrl(value ?? '') }}
        render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
          <FormGroupWithErrorText label={t('AAP URL')} isRequired fieldId={HookField.AapUrl}>
            <TextInput
              onChange={onChange}
              value={value ?? ''}
              spellCheck="false"
              validated={getInputValidated(fieldError)}
              type="text"
              data-testid="hook-edit-aap-url-input"
              placeholder={AAP_URL_PLACEHOLDER}
            />
            {!fieldError && (
              <FormHelperText>
                {t('URL of your Ansible Automation Platform instance')}
              </FormHelperText>
            )}
          </FormGroupWithErrorText>
        )}
      />

      <AapTokenEditField control={control} existingSecretName={existingSecretName} />

      <Controller
        control={control}
        name={HookField.AapTimeout}
        render={({ field: { onChange, value } }) => (
          <FormGroup label={t('Timeout (seconds)')} fieldId={HookField.AapTimeout}>
            <TextInput
              id={HookField.AapTimeout}
              data-testid="hook-edit-aap-timeout-input"
              value={value ?? ''}
              onChange={(_event, val) => {
                if (!NUMERIC_ONLY_PATTERN.test(val)) {
                  return;
                }
                onChange(val ? Number(val) : undefined);
              }}
            />
            <FormHelperText>
              {t('Timeout for AAP job execution. Defaults to 1 hour if not specified.')}
            </FormHelperText>
          </FormGroup>
        )}
      />

      <FormGroup fieldId="aap-edit-connect-action">
        <Button
          variant={ButtonVariant.primary}
          onClick={handleConnect}
          isDisabled={isConnectDisabled}
          isLoading={isConnecting}
          data-testid="hook-edit-aap-connect-button"
        >
          {isConnecting ? t('Connecting...') : t('Connect to AAP')}
        </Button>
      </FormGroup>

      <ConnectionStatusAlert status={status} error={error} templateCount={templates.length} />

      <AapJobTemplateEditField
        control={control}
        status={status}
        templateOptions={templateOptions}
      />
    </>
  );
};

export default AapHookEditFields;
