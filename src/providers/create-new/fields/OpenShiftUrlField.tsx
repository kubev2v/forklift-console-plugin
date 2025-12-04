import type { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { validateURL } from 'src/modules/Providers/utils/validators/common';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from './constants';

const OpenShiftUrlField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenshiftUrl,
    rules: {
      validate: {
        validUrl: async (val: string | undefined) => {
          if (!val || val.trim() === '') {
            return true;
          }

          const trimmedValue = val.trim();
          if (!validateURL(trimmedValue)) {
            return t(
              'The URL is invalid. URL should include the schema, for example: https://example.com:6443.',
            );
          }

          return true;
        },
      },
    },
  });

  return (
    <FormGroupWithHelpText
      label={t('API endpoint URL')}
      fieldId={ProviderFormFieldId.OpenshiftUrl}
      validated={getInputValidated(error)}
      labelHelp={
        <HelpIconPopover header={t('API endpoint URL')}>
          {t('When the URL field is left empty, the local OpenShift cluster is used.')}
        </HelpIconPopover>
      }
      helperText={t('The URL of the API endpoint, for example: https://example.com:6443.')}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.OpenshiftUrl}
        type="text"
        value={value ?? ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
        data-testid="openshift-url-input"
        spellCheck="false"
      />
    </FormGroupWithHelpText>
  );
};

export default OpenShiftUrlField;
