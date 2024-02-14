import React, { FC, useState } from 'react';
import { calculateThumbprint, useTlsCertificate } from 'src/modules/Providers/hooks';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Loading } from '@kubev2v/common';
import { Alert, Button, Modal, ModalVariant } from '@patternfly/react-core';

import { VerifyCertificate } from './VerifyCertificate';

export const FetchCertificateModal: FC<{
  url: string;
  existingCert: string;
  handleSave: (cert: string) => void;
}> = ({ existingCert, url, handleSave }) => {
  const { toggleModal } = useModal();
  const { t } = useForkliftTranslation();
  const [isTrusted, setIsTrusted] = useState(false);
  const { loading, fetchError, certError, thumbprint, issuer, validTo, certificate } =
    useTlsCertificate(url);
  const success = !loading && !fetchError && !certError;
  const hasThumbprintChanged =
    existingCert && success && thumbprint !== calculateThumbprint(existingCert);
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
          onClick={() => {
            handleSave(certificate);
            toggleModal();
          }}
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
          {t('The certificate is not a valid PEM encoded X.509 certificate')}
        </Alert>
      )}

      {success && (
        <VerifyCertificate
          {...{ thumbprint, issuer, validTo, isTrusted, setIsTrusted, hasThumbprintChanged }}
        />
      )}
    </Modal>
  );
};
