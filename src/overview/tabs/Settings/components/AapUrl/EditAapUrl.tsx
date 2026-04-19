import type { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';

import AapUrlHelpContent from './AapUrlHelpContent';

const EditAapUrl: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  return (
    <FormGroupWithHelpText
      label={t('AAP URL')}
      labelHelp={
        <HelpIconPopover header={t('AAP URL')}>
          <AapUrlHelpContent />
        </HelpIconPopover>
      }
      helperText={t(
        'Base URL of the Ansible Automation Platform instance (e.g. https://aap.example.com).',
      )}
    >
      <Controller
        control={control}
        name={SettingsFields.AapUrl}
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value ?? ''}
            onChange={(_event, val) => {
              onChange(val);
            }}
            placeholder="https://aap.example.com"
            data-testid="aap-url-settings-input"
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditAapUrl;
