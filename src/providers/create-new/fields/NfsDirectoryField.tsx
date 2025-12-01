import type { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { NFS_PATH_REGEX } from '../utils/validationPatterns';

import { ProviderFormFieldId } from './constants';

const NfsDirectoryField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.NfsDirectory,
    rules: {
      required: t('NFS shared directory is required'),
      validate: {
        pattern: async (val: string) => {
          if (!NFS_PATH_REGEX.test(val)) {
            return t('NFS path must be in format: host:/path (e.g., 10.10.0.10:/ova)');
          }

          return true;
        },
      },
    },
  });

  return (
    <FormGroupWithHelpText
      label={t('NFS shared directory')}
      isRequired
      fieldId={ProviderFormFieldId.NfsDirectory}
      validated={error ? 'error' : 'default'}
      helperText={t('For example: 10.10.0.10:/ova')}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.NfsDirectory}
        type="text"
        value={value ?? ''}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={error ? 'error' : 'default'}
        data-testid="nfs-directory-input"
      />
    </FormGroupWithHelpText>
  );
};

export default NfsDirectoryField;
