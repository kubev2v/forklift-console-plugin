import type { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import {
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Radio,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import CACertificateField from './CACertificateField';
import { CertificateValidationMode, ProviderFormFieldId } from './constants';

const CertificateValidationField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();

  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({
    control,
    defaultValue: CertificateValidationMode.Configure,
    name: ProviderFormFieldId.CertificateValidation,
    rules: {
      required: t('Certificate validation method is required'),
    },
  });

  return (
    <FormGroupWithHelpText
      isRequired
      label={t('Certificate validation')}
      fieldId={ProviderFormFieldId.CertificateValidation}
      role="radiogroup"
      validated={getInputValidated(error)}
      helperTextInvalid={error?.message}
    >
      <Stack hasGutter>
        <HelperText>
          <HelperTextItem>
            {t(
              'Manage the SSL/TLS certificate used to secure the connection to the provider. You can upload a custom CA certificate or skip this step.',
            )}
          </HelperTextItem>
        </HelperText>

        <Radio
          id="certificate-validation-configure"
          name={ProviderFormFieldId.CertificateValidation}
          label={t('Configure certificate validation')}
          isChecked={value === CertificateValidationMode.Configure}
          onChange={() => {
            onChange(CertificateValidationMode.Configure);
          }}
          data-testid="certificate-validation-configure"
          body={value === CertificateValidationMode.Configure && <CACertificateField />}
        />

        <Radio
          id="certificate-validation-skip"
          name={ProviderFormFieldId.CertificateValidation}
          label={
            <Flex
              spaceItems={{ default: 'spaceItemsXs' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>{t('Skip certificate validation')}</FlexItem>

              <HelpIconPopover header={t('Skip certificate validation')}>
                <Stack hasGutter>
                  <StackItem>
                    {t(
                      'By skipping certificate validation, the migration will be insecure and a certificate is not required.',
                    )}
                  </StackItem>
                  <StackItem>
                    {t(
                      'Insecure migration means that the transferred data is sent over an insecure connection and potentially sensitive data could be exposed.',
                    )}
                  </StackItem>
                </Stack>
              </HelpIconPopover>
            </Flex>
          }
          isChecked={value === CertificateValidationMode.Skip}
          onChange={() => {
            onChange(CertificateValidationMode.Skip);
          }}
          data-testid="certificate-validation-skip"
        />
      </Stack>
    </FormGroupWithHelpText>
  );
};

export default CertificateValidationField;
