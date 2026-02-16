import TextInputEditModal from 'src/components/ModalForm/TextInputEditModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

import { validateOvirtURL } from '../../utils/validators/provider/ovirt/validateOvirtURL';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const OvirtEditURLModal: ModalComponent<EditProviderURLModalProps> = ({
  resource: provider,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const description = (
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
      helperText={t('The URL of the Red Hat Virtualization Manager API endpoint.')}
      validationHook={validateOvirtURL}
      onConfirm={onConfirm}
    />
  );
};
