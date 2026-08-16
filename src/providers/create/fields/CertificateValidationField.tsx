import { type FC, useCallback, useState } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Radio,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../hooks/useCreateProviderFormContext';

import CACertificateField from './CACertificateField';
import { CertificateValidationMode, ProviderFormFieldId } from './constants';

const CertificateValidationField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const certificateController = useController({
    control,
    defaultValue: CertificateValidationMode.Configure,
    name: ProviderFormFieldId.CertificateValidation,
    rules: {
      required: t('Certificate validation method is required'),
    },
  });
  const value = certificateController.field.value as CertificateValidationMode;
  const { onChange } = certificateController.field;
  const { error } = certificateController.fieldState;

  const handleSkipRequest = useCallback(() => {
    setIsConfirmOpen(true);
  }, []);

  const handleConfirmSkip = useCallback(() => {
    onChange(CertificateValidationMode.Skip);
    setIsConfirmOpen(false);
  }, [onChange]);

  const handleCancelSkip = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  return (
    <>
      <FormGroupWithHelpText
        fieldId={ProviderFormFieldId.CertificateValidation}
        helperTextInvalid={error?.message}
        isRequired
        label={t('Certificate validation')}
        role="radiogroup"
        validated={getInputValidated(error)}
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
            body={value === CertificateValidationMode.Configure && <CACertificateField />}
            data-testid="certificate-validation-configure"
            id="certificate-validation-configure"
            isChecked={value === CertificateValidationMode.Configure}
            label={t('Configure certificate validation')}
            name={ProviderFormFieldId.CertificateValidation}
            onChange={() => {
              onChange(CertificateValidationMode.Configure);
            }}
          />

          <Radio
            data-testid="certificate-validation-skip"
            id="certificate-validation-skip"
            isChecked={value === CertificateValidationMode.Skip}
            label={
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsXs' }}
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
            name={ProviderFormFieldId.CertificateValidation}
            onChange={handleSkipRequest}
          />
        </Stack>
      </FormGroupWithHelpText>

      <Modal
        aria-label={t('Confirm skip certificate validation')}
        isOpen={isConfirmOpen}
        onClose={handleCancelSkip}
        variant={ModalVariant.small}
      >
        <ModalHeader title={t('Skip certificate validation?')} />
        <ModalBody>
          {t(
            'Disabling certificate validation exposes the connection to potential man-in-the-middle attacks. Sensitive data such as credentials and virtual machine disks may be intercepted during migration.',
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            data-testid="confirm-skip-certificate-validation"
            onClick={handleConfirmSkip}
            variant={ButtonVariant.danger}
          >
            {t('Skip validation')}
          </Button>
          <Button onClick={handleCancelSkip} variant={ButtonVariant.link}>
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CertificateValidationField;
