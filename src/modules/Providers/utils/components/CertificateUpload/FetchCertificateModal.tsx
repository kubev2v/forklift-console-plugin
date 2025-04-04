import { type FC, useState } from 'react';
import { Loading } from 'src/components/common/Page/PageStates';
import {
  calculateThumbprint,
  useTlsCertificate,
} from 'src/modules/Providers/hooks/useTlsCertificate';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Alert, Button, Modal, ModalVariant } from '@patternfly/react-core';

import { VerifyCertificate } from './VerifyCertificate';

export const FetchCertificateModal: FC<{
  url: string;
  existingCert: string;
  handleSave: (cert: string) => void;
}> = ({ existingCert, handleSave, url }) => {
  const { toggleModal } = useModal();
  const { t } = useForkliftTranslation();
  const [isTrusted, setIsTrusted] = useState(false);
  const { certError, certificate, fetchError, issuer, loading, thumbprint, validTo } =
    useTlsCertificate(url);
  const success = !loading && !fetchError && !certError;
  const hasThumbprintChanged =
    existingCert && success && thumbprint !== calculateThumbprint(existingCert);

  const onClick = () => {
    handleSave(certificate);
    toggleModal();
  };

  return (
    <Modal
      title={t('Verify certificate')}
      position="top"
      showClose={true}
      variant={ModalVariant.small}
      isOpen={true}
      onClose={toggleModal}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={onClick}
          isDisabled={!success || !isTrusted}
        >
          {t('Confirm')}
        </Button>,
        <Button key="cancel" variant="secondary" onClick={toggleModal}>
          {t('Cancel')}
        </Button>,
      ]}
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
    </Modal>
  );
};
