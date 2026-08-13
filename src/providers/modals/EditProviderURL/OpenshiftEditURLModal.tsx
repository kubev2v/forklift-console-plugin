import TextInputEditModal from 'src/components/ModalForm/TextInputEditModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';

import { validateOpenshiftURL } from '../../utils/validators/provider/openshift/validateOpenshiftURL';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenshiftEditURLModal: OverlayComponent<EditProviderURLModalProps> = ({
  closeOverlay,
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();

  const description = (
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

  const onConfirm = async (value: string): Promise<void> => {
    await patchProviderURL({
      newValue: value,
      resource: provider,
    });
  };

  return (
    <TextInputEditModal
      closeOverlay={closeOverlay}
      description={description}
      helperText={t('URL of the Openshift Virtualization API endpoint.')}
      initialValue={provider?.spec?.url ?? ''}
      label={t('URL')}
      onConfirm={onConfirm}
      title={t('Edit URL')}
      validationHook={validateOpenshiftURL}
    />
  );
};
