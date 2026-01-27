import { providerUiAnnotation } from 'src/providers/utils/constants';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';

import { validateOpenstackUILink } from '../../utils/validators/provider/openstack/validateOpenstackUILink';
import { EditModal } from '../EditModal/EditModal';

import { patchProviderUI } from './utils/patchProviderUI';
import type { EditProviderUIModalProps } from './EditProviderUIModal';

export const OpenstackEditUIModal: ModalComponent<EditProviderUIModalProps> = ({
  label = '',
  title = '',
  ...props
}) => {
  const { t } = useForkliftTranslation();

  const ModalBody = (
    <ForkliftTrans>
      <p>Link for the OpenStack dashboard UI.</p>
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
      jsonPath={['metadata', 'annotations', providerUiAnnotation]}
      title={title || t('Edit provider web UI link')}
      label={label || t('Provider web UI link')}
      model={ProviderModel}
      variant={ModalVariant.large}
      body={ModalBody}
      helperText={t(
        'Link for the OpenStack dashboard. For example, https://identity_service.com/dashboard.',
      )}
      onConfirmHook={patchProviderUI}
      validationHook={validateOpenstackUILink}
    />
  );
};
