import TextInputEditModal from 'src/components/ModalForm/TextInputEditModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

import { validateOpenstackURL } from '../../utils/validators/provider/openstack/validateOpenstackURL';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenstackEditURLModal: ModalComponent<EditProviderURLModalProps> = ({
  resource: provider,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const description = (
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
      helperText={t('The URL of the OpenStack Identity endpoint.')}
      validationHook={validateOpenstackURL}
      onConfirm={onConfirm}
    />
  );
};
