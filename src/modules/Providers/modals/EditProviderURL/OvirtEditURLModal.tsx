import type { FC } from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core/deprecated';

import { validateOvirtURL } from '../../utils/validators/provider/ovirt/validateOvirtURL';
import { EditModal } from '../EditModal/EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OvirtEditURLModal: FC<EditProviderURLModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>URL of the Red Hat Virtualization Manager (RHVM) API endpoint.</p>
      <br />
      <p>
        The format of the provided URL of the Red Hat Virtualization Manager (RHVM) API endpoint
        should include a scheme, a domain name, path, and optionally a port. Usually the path will
        end with /api, for example: <strong>https://rhv-host-example.com/ovirt-engine/api</strong>.
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
      helperText={t(
        'The URL of the Red Hat Virtualization Manager (RHVM) API endpoint, for example: https://rhv-host-example.com/ovirt-engine/api .',
      )}
      onConfirmHook={patchProviderURL}
      validationHook={validateOvirtURL}
    />
  );
};
