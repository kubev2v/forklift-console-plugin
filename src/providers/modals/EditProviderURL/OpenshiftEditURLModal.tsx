import TextInputEditModal from 'src/components/ModalForm/TextInputEditModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

import { validateOpenshiftURL } from '../../utils/validators/provider/openshift/validateOpenshiftURL';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenshiftEditURLModal: ModalComponent<EditProviderURLModalProps> = ({
  resource: provider,
  ...rest
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
      {...rest}
      title={t('Edit URL')}
      label={t('URL')}
      initialValue={provider?.spec?.url ?? ''}
      description={description}
      helperText={t('URL of the Openshift Virtualization API endpoint.')}
      validationHook={validateOpenshiftURL}
      onConfirm={onConfirm}
    />
  );
};
