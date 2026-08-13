import { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Stack } from '@patternfly/react-core';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { onConfirmProviderDefaultTransferNetwork } from './utils/onConfirmProviderDefaultTransferNetwork';
import ProviderDefaultTransferNetworkDropdown from './ProviderDefaultTransferNetworkDropdown';

export type EditProviderDefaultTransferNetworkProps = {
  defaultNetworkName: string | undefined;
  resource: V1beta1Provider;
};

const EditProviderDefaultTransferNetwork: OverlayComponent<
  EditProviderDefaultTransferNetworkProps
> = ({ closeOverlay, defaultNetworkName, resource }) => {
  const { t } = useForkliftTranslation();

  const [value, setValue] = useState<string | number>(defaultNetworkName ?? 0);

  if (resource?.spec?.type !== PROVIDER_TYPES.openshift) {
    return null;
  }

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      onConfirm={async () => onConfirmProviderDefaultTransferNetwork({ resource, value })}
      title={t('Set default Transfer Network')}
    >
      <Stack hasGutter>
        {t(
          `You can select a default migration network for an OpenShift Virtualization provider in the Red Hat OpenShift web console to improve performance.
        The default migration network is used to transfer disks to the namespaces in which it is configured.If you do not select a migration network,
        the default migration network is the pod network, which might not be optimal for disk transfer.`,
        )}
        <FormGroupWithHelpText
          helperText={t('Please choose a NetworkAttachmentDefinition for default data transfer.')}
          label={t('Default transfer Network')}
        >
          <ProviderDefaultTransferNetworkDropdown
            onChange={setValue}
            provider={resource}
            value={value}
          />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditProviderDefaultTransferNetwork;
