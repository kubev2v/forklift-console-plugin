import type { FC } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { NFS_PATH_REGEX } from '../../utils/validationPatterns';
import { ProviderFormFieldId } from '../constants';

const NfsDirectoryField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.NfsDirectory,
    rules: {
      required: t('NFS shared directory is required'),
      validate: {
        pattern: async (val: string | undefined) => {
          if (!val || !NFS_PATH_REGEX.test(val)) {
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
      validated={getInputValidated(error)}
      helperText={t('For example: 10.10.0.10:/ova')}
      helperTextInvalid={error?.message}
    >
      <TextInput
        id={ProviderFormFieldId.NfsDirectory}
        type="text"
        value={value}
        onChange={(_event, val) => {
          onChange(val);
        }}
        validated={getInputValidated(error)}
        data-testid="nfs-directory-input"
      />
    </FormGroupWithHelpText>
  );
};

export default NfsDirectoryField;
