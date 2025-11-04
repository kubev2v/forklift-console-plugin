import { useState } from 'react';
import { Loading } from 'src/components/common/Page/PageStates';
import {
  calculateThumbprint,
  useTlsCertificate,
} from 'src/modules/Providers/hooks/useTlsCertificate';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, ModalVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import VerifyCertificate from './VerifyCertificate';

export type FetchCertificateModalProps = {
  url: string;
  existingCert: string;
  handleSave: (cert: string) => void;
};

const FetchCertificateModal: ModalComponent<FetchCertificateModalProps> = ({
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
      title={t('Verify certificate')}
      variant={ModalVariant.small}
      onConfirm={onConfirm}
      isDisabled={!isTrusted}
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
