import type { FC } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { validatePublicCert } from 'src/modules/Providers/utils/validators/common';
import CertificateUpload from 'src/providers/components/CertificateUpload/CertificateUpload';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Stack, StackItem } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { CertificateValidationMode, ProviderFormFieldId } from './constants';

const CACertificateField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();

  const [certificateValidation, url] = useWatch({
    control,
    name: [ProviderFormFieldId.CertificateValidation, ProviderFormFieldId.OpenshiftUrl],
  });

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.CaCertificate,
    rules: {
      validate: {
        validCertificate: async (val: string | undefined) => {
          if (certificateValidation !== CertificateValidationMode.Configure) {
            return true;
          }

          if (!val || val.trim() === '') {
            return t('CA certificate is required when certificate validation is configured');
          }

          const trimmedValue = val.trim();
          if (!validatePublicCert(trimmedValue)) {
            return t('The CA certificate is not valid.');
          }

          return true;
        },
      },
    },
  });

  const isDisabled = certificateValidation === CertificateValidationMode.Skip;

  return (
    <FormGroupWithHelpText
      isRequired
      label={t('CA certificate')}
      fieldId={ProviderFormFieldId.CaCertificate}
      validated={getInputValidated(error)}
      labelHelp={
        <HelpIconPopover header={t('CA certificate')}>
          <Stack hasGutter>
            <StackItem>
              {t(
                'A CA certificate to be trusted when connecting to Openshift API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format.',
              )}
            </StackItem>

            <StackItem>
              {t(
                'To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty. The certificate is not verified when Skip certificate validation is set.',
              )}
            </StackItem>
          </Stack>
        </HelpIconPopover>
      }
      helperText={t(
        'Upload a CA certificate to be trusted when connecting to Openshift API endpoint, or leave empty to use the system CA certificate.',
      )}
      helperTextInvalid={error?.message}
    >
      <CertificateUpload
        id={ProviderFormFieldId.CaCertificate}
        type="text"
        value={value}
        url={url}
        className="pf-v6-u-p-0"
        filenamePlaceholder={t('Drag and drop a file or upload one')}
        onDataChange={(_event, val) => {
          onChange(val);
        }}
        onTextChange={(_event, val) => {
          onChange(val);
        }}
        onClearClick={() => {
          onChange('');
        }}
        browseButtonText={t('Upload')}
        validated={getInputValidated(error)}
        isDisabled={isDisabled}
      />
    </FormGroupWithHelpText>
  );
};

export default CACertificateField;
