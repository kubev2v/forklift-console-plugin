import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { isValidSmbPath } from '../../utils/validationPatterns';
import { ProviderFormFieldId } from '../constants';

const SmbDirectoryField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.SmbDirectory,
    rules: {
      required: t('SMB shared directory is required'),
      validate: {
        pattern: async (val: string | undefined) => {
          if (!val || !isValidSmbPath(val)) {
            return t('SMB path must be in format: //server/share or \\\\server\\share');
          }

          return true;
        },
      },
    },
  });

  return (
    <FormGroupWithHelpText
      label={t('SMB shared directory')}
      isRequired
      fieldId={ProviderFormFieldId.SmbDirectory}
      validated={getInputValidated(error)}
      helperText={t('For example: //server/share or \\\\server\\share')}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.SmbDirectory}
        type="text"
        value={value}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
      />
    </FormGroupWithHelpText>
  );
};

export default SmbDirectoryField;
