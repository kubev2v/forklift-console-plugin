import type { FC } from 'react';
import { useController, useWatch } from 'react-hook-form';
import CertificateUpload from 'src/providers/components/CertificateUpload/CertificateUpload';
import { validatePublicCert } from 'src/utils/validation/common';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Stack, StackItem } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import { useUrlByProviderType } from './hooks/useUrlByProviderType';
import { CertificateValidationMode, ProviderFormFieldId } from './constants';

const CACertificateField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const certificateValidation = useWatch({
    control,
    name: ProviderFormFieldId.CertificateValidation,
  });

  const url = useUrlByProviderType();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.CaCertificate,
    rules: {
      validate: {
        validCertificate: (val: string | undefined) => {
          if (certificateValidation !== CertificateValidationMode.Configure) {
            return undefined;
          }

          const trimmedValue = val?.trim() ?? '';
          if (!trimmedValue) {
            return t('CA certificate is required when certificate validation is configured');
          }

          if (!validatePublicCert(trimmedValue)) {
            return t('The CA certificate is not valid.');
          }

          return undefined;
        },
      },
    },
  });

  const isDisabled = certificateValidation === CertificateValidationMode.Skip;

  return (
    <FormGroupWithHelpText
      fieldId={ProviderFormFieldId.CaCertificate}
      helperText={t(
        'Upload a CA certificate to be trusted when connecting to Openshift API endpoint, or leave empty to use the system CA certificate.',
      )}
      helperTextInvalid={error?.message}
      isRequired
      label={t('CA certificate')}
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
      testId="ca-certificate-helper"
      validated={getInputValidated(error)}
    >
      <CertificateUpload
        browseButtonText={t('Upload')}
        className="pf-v6-u-p-0"
        filenamePlaceholder={t('Drag and drop a file or upload one')}
        id={ProviderFormFieldId.CaCertificate}
        isDisabled={isDisabled}
        onClearClick={() => {
          onChange('');
        }}
        onDataChange={(_event, val) => {
          onChange(val);
        }}
        onTextChange={(_event, val) => {
          onChange(val);
        }}
        type="text"
        url={url}
        validated={getInputValidated(error)}
        value={value}
      />
    </FormGroupWithHelpText>
  );
};

export default CACertificateField;
