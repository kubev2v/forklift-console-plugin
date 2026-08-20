import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';

import { normalizeAapUrl, validateAapUrl } from './utils/validateAapUrl';
import AapUrlHelpContent from './AapUrlHelpContent';

const EditAapUrl: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <Controller
      control={control}
      name={SettingsFields.AapUrl}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupWithHelpText
          fieldId={SettingsFields.AapUrl}
          helperText={t(
            'Base URL of the Ansible Automation Platform instance (e.g. https://aap.example.com).',
          )}
          helperTextInvalid={error?.message}
          label={t('AAP URL')}
          labelHelp={
            <HelpIconPopover header={t('AAP URL')}>
              <AapUrlHelpContent />
            </HelpIconPopover>
          }
          validated={getInputValidated(error)}
        >
          <TextInput
            data-testid="aap-url-settings-input"
            id={SettingsFields.AapUrl}
            onChange={(_event, val) => {
              onChange(normalizeAapUrl(val));
            }}
            placeholder="https://aap.example.com"
            validated={getInputValidated(error)}
            value={value ?? ''}
          />
        </FormGroupWithHelpText>
      )}
      rules={{ validate: validateAapUrl }}
    />
  );
};

export default EditAapUrl;
