import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Alert,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

/**
 * Verify the certificate. Logic and UI based on the component used in the standalone MTV UI.
 * @link https://github.com/kubev2v/forklift-ui/blob/c347020d3162b891636c3109e426343911b6c498/pkg/web/src/app/Providers/components/AddEditProviderModal/AddEditProviderModal.tsx#L399
 */
type VerifyCertificateProps = {
  hasThumbprintChanged: boolean;
  issuer: string;
  isTrusted: boolean;
  setIsTrusted: (flag: boolean) => void;
  thumbprint: string;
  validTo?: Date;
};

const VerifyCertificate: FC<VerifyCertificateProps> = ({
  hasThumbprintChanged,
  issuer,
  isTrusted,
  setIsTrusted,
  thumbprint,
  validTo,
}) => {
  const { t } = useForkliftTranslation();

  const onChange = (checked: boolean): void => {
    setIsTrusted(checked);
  };

  return (
    <>
      {hasThumbprintChanged && (
        <Alert isInline title={t('Certificate change detected')} variant="warning">
          {t(
            'The current certificate does not match the certificate fetched from URL. Manually validate the fingerprint before proceeding.',
          )}
        </Alert>
      )}
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Issuer')}</DescriptionListTerm>
              <DescriptionListDescription id="issuer">{issuer}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('SHA-1 fingerprint')}</DescriptionListTerm>
              <DescriptionListDescription id="fingerprint">{thumbprint}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Expiration date')}</DescriptionListTerm>
              <DescriptionListDescription id="expiration">
                {validTo?.toUTCString() ?? ''}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </FlexItem>
        <FlexItem>
          <Checkbox
            id="certificate-check"
            isChecked={isTrusted}
            label={t('I trust the authenticity of this certificate')}
            name="certificateCheck"
            onChange={(_event, value) => {
              onChange(value);
            }}
          />
        </FlexItem>
      </Flex>
    </>
  );
};

export default VerifyCertificate;
