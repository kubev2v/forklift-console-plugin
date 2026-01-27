import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';

import { validateOpenshiftURL } from '../../utils/validators/provider/openshift/validateOpenshiftURL';
import { EditModal } from '../EditModal/EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenshiftEditURLModal: ModalComponent<EditProviderURLModalProps> = ({
  label = '',
  title = '',
  ...props
}) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>URL of the Openshift Virtualization API endpoint.</p>
      <br />
      <p>
        The format of the provided URL of the Openshift Virtualization API endpoint should include a
        scheme, a domain name, and, optionally a port. For example:{' '}
        <strong>https://api.openshift-domain.com:6443</strong>.
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
      helperText={t('URL of the Openshift Virtualization API endpoint.')}
      validationHook={validateOpenshiftURL}
      onConfirmHook={patchProviderURL}
    />
  );
};
