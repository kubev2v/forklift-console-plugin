import type { FC } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core/deprecated';

import { validateOpenshiftURL } from '../../utils/validators/provider/openshift/validateOpenshiftURL';
import { EditModal } from '../EditModal/EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenshiftEditURLModal: FC<EditProviderURLModalProps> = (props) => {
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
      title={props?.title || t('Edit URL')}
      label={props?.label || t('URL')}
      model={ProviderModel}
      variant={ModalVariant.large}
      body={ModalBody}
      helperText={t('URL of the Openshift Virtualization API endpoint.')}
      validationHook={validateOpenshiftURL}
      onConfirmHook={patchProviderURL}
    />
  );
};
