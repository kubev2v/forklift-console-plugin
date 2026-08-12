import { useState } from 'react';
import { Loading } from 'src/components/common/Page/PageStates';
import { calculateThumbprint, useTlsCertificate } from 'src/providers/hooks/useTlsCertificate';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, ModalVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import VerifyCertificate from './VerifyCertificate';

export type FetchCertificateModalProps = {
  existingCert: string;
  handleSave: (cert: string) => void;
  url: string;
};

const FetchCertificateModal: OverlayComponent<FetchCertificateModalProps> = ({
  closeOverlay,
  existingCert,
  handleSave,
  url,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [isTrusted, setIsTrusted] = useState(false);
  const { certError, certificate, fetchError, issuer, loading, thumbprint, validTo } =
    useTlsCertificate(url);
  const success = !loading && !fetchError && !certError;
  const hasThumbprintChanged =
    !isEmpty(existingCert) && success && thumbprint !== calculateThumbprint(existingCert);

  const onConfirm = async () => {
    handleSave(certificate);
    return Promise.resolve(undefined);
  };

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      isDisabled={!isTrusted}
      onConfirm={onConfirm}
      title={t('Verify certificate')}
      variant={ModalVariant.small}
      {...rest}
    >
      {loading && <Loading title={t('Loading...')} />}

      {fetchError && (
        <Alert isInline title={t('Error')} variant="danger">
          {t('Cannot retrieve certificate')}
        </Alert>
      )}

      {certError && (
        <Alert isInline title={'Error'} variant="danger">
          {t('The certificate is not a valid PEM-encoded X.509 certificate')}
        </Alert>
      )}

      {success && (
        <VerifyCertificate
          {...{ hasThumbprintChanged, issuer, isTrusted, setIsTrusted, thumbprint, validTo }}
        />
      )}
    </ModalForm>
  );
};

export default FetchCertificateModal;
