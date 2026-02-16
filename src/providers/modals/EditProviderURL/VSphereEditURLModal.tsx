import TextInputEditModal from 'src/components/ModalForm/TextInputEditModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';

import { validateEsxiURL } from '../../utils/validators/provider/vsphere/validateEsxiURL';
import { validateVCenterURL } from '../../utils/validators/provider/vsphere/validateVCenterURL';

import { patchProviderURL } from './utils/patchProviderURL';
import type { EditProviderURLModalProps } from './EditProviderURLModal';

export const VSphereEditURLModal: ModalComponent<EditProviderURLModalProps> = ({
  insecureSkipVerify,
  resource: provider,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const sdkEndpoint = provider?.spec?.settings?.sdkEndpoint ?? '';
  const validationHook =
    sdkEndpoint === 'esxi'
      ? validateEsxiURL
      : (url: string) => validateVCenterURL(url, insecureSkipVerify);

  const description = (
    <ForkliftTrans>
      <p>URL of the vCenter API endpoint.</p>
      <br />
      <p>
        The format of the URL of the vCenter API endpoint should include a scheme, a domain name,
        path, and optionally a port. Usually the path will end with /sdk, for example:{' '}
        <strong>https://vCenter-host-example.com/sdk</strong>.
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
      helperText={t('The URL of the vCenter API endpoint.')}
      validationHook={validationHook}
      onConfirm={onConfirm}
    />
  );
};
