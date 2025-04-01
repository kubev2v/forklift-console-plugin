import React, { type FC } from 'react';
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
export const VerifyCertificate: FC<{
  thumbprint: string;
  issuer: string;
  validTo: Date;
  hasThumbprintChanged: boolean;
  isTrusted: boolean;
  setIsTrusted: (flag: boolean) => void;
}> = ({ hasThumbprintChanged, issuer, isTrusted, setIsTrusted, thumbprint, validTo }) => {
  const { t } = useForkliftTranslation();

  const onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    setIsTrusted(checked);
  };

  return (
    <>
      {hasThumbprintChanged && (
        <Alert variant="warning" isInline title={t('Certificate change detected')}>
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
            label={t('I trust the authenticity of this certificate')}
            id="certificate-check"
            name="certificateCheck"
            isChecked={isTrusted}
            onChange={(e, v) => {
              onChange(v, e);
            }}
          />
        </FlexItem>
      </Flex>
    </>
  );
};
