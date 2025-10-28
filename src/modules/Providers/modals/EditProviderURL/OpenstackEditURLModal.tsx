import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';

import { validateOpenstackURL } from '../../utils/validators/provider/openstack/validateOpenstackURL';
import { EditModal } from '../EditModal/EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenstackEditURLModal: ModalComponent<EditProviderURLModalProps> = ({
  label = '',
  title = '',
  ...props
}) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>URL of the OpenStack Identity (Keystone) endpoint.</p>
      <br />
      <p>
        The format of the provided URL of the OpenStack Identity (Keystone) API endpoint should
        include a scheme, a domain name, path, and optionally a port. Usually the path will indicate
        the server version, for example: <strong>https://identity_service.com:5000/v3</strong>.
      </p>
    </ForkliftTrans>
  );

  return (
    <EditModal
      {...props}
      jsonPath={'spec.url'}
      title={title || t('Edit URL')}
      label={label || t('URL')}
      model={ProviderModel}
      variant={ModalVariant.large}
      body={ModalBody}
      helperText={t(
        'The URL of the OpenStack Identity (Keystone) endpoint, for example: https://identity_service.com:5000/v3',
      )}
      onConfirmHook={patchProviderURL}
      validationHook={validateOpenstackURL}
    />
  );
};
