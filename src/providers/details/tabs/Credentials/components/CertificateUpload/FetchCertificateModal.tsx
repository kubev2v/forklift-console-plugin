import { type FC, useState } from 'react';
import { Loading } from 'src/components/common/Page/PageStates';
import {
  calculateThumbprint,
  useTlsCertificate,
} from 'src/modules/Providers/hooks/useTlsCertificate';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { Alert } from '@patternfly/react-core';
import { ModalVariant } from '@patternfly/react-core/deprecated';

import VerifyCertificate from './VerifyCertificate';

const FetchCertificateModal: FC<{
  url: string;
  existingCert: string;
  handleSave: (cert: string) => void;
}> = ({ existingCert, handleSave, url }) => {
  const { t } = useForkliftTranslation();
  const [isTrusted, setIsTrusted] = useState(false);
  const { certError, certificate, fetchError, issuer, loading, thumbprint, validTo } =
    useTlsCertificate(url);
  const success = !loading && !fetchError && !certError;
  const hasThumbprintChanged =
    existingCert && success && thumbprint !== calculateThumbprint(existingCert);

  const onConfirm = () => {
    handleSave(certificate);
  };

  return (
    <ModalForm
      title={t('Verify certificate')}
      variant={ModalVariant.small}
      onConfirm={onConfirm}
      isDisabled={!isTrusted}
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
