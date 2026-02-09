import TextInputEditModal from 'src/components/ModalForm/TextInputEditModal';
import { providerUiAnnotation } from 'src/providers/utils/constants';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

import { validateOvirtUILink } from '../../utils/validators/provider/ovirt/validateOvirtUILink';

import { patchProviderUI } from './utils/patchProviderUI';
import type { EditProviderUIModalProps } from './EditProviderUIModal';

export const OvirtEditUIModal: ModalComponent<EditProviderUIModalProps> = ({
  resource: provider,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const description = (
    <ForkliftTrans>
      <p>Link for the Red Hat Virtualization Manager landing page.</p>
      <p>
        Use this link to access the user interface for the provider&apos;s virtualization
        management.
      </p>
      <p>If no link value is specify then a default auto calculated or an empty value is set.</p>
    </ForkliftTrans>
  );

  const onConfirm = async (value: string): Promise<void> => {
    await patchProviderUI({
      newValue: value,
      resource: provider,
    });
  };

  return (
    <TextInputEditModal
      {...rest}
      title={t('Edit provider web UI link')}
      label={t('Provider web UI link')}
      initialValue={provider?.metadata?.annotations?.[providerUiAnnotation] ?? ''}
      description={description}
      helperText={t(
        'Link for the Red Hat Virtualization Manager landing page. For example, https://rhv-host-example.com/ovirt-engine.',
      )}
      validationHook={validateOvirtUILink}
      onConfirm={onConfirm}
    />
  );
};
