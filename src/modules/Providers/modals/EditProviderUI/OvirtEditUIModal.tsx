import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';

import { validateOvirtUILink } from '../../utils/validators/provider/ovirt/validateOvirtUILink';
import { EditModal } from '../EditModal/EditModal';

import { patchProviderUI } from './utils/patchProviderUI';
import type { EditProviderUIModalProps } from './EditProviderUIModal';

export const OvirtEditUIModal: ModalComponent<EditProviderUIModalProps> = ({
  label = '',
  title = '',
  ...props
}) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>Link for the Red Hat Virtualization Manager landing page.</p>
      <p>
        Use this link to access the user interface for the provider&apos;s virtualization
        management.
      </p>
      <p>If no link value is specify then a default auto calculated or an empty value is set.</p>
    </ForkliftTrans>
  );

  return (
    <EditModal
      {...props}
      jsonPath={['metadata', 'annotations', 'forklift.konveyor.io/providerUI']}
      title={title || t('Edit provider web UI link')}
      label={label || t('Provider web UI link')}
      model={ProviderModel}
      variant={ModalVariant.large}
      body={ModalBody}
      helperText={t(
        'Link for the Red Hat Virtualization Manager landing page. For example, https://rhv-host-example.com/ovirt-engine.',
      )}
      onConfirmHook={patchProviderUI}
      validationHook={validateOvirtUILink}
    />
  );
};
