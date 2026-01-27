import { useState } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Stack } from '@patternfly/react-core';

import { onConfirmProviderDefaultTransferNetwork } from './utils/onConfirmProviderDefaultTransferNetwork';
import ProviderDefaultTransferNetworkDropdown from './ProviderDefaultTransferNetworkDropdown';

export type EditProviderDefaultTransferNetworkProps = {
  resource: V1beta1Provider;
  defaultNetworkName: string | undefined;
};

const EditProviderDefaultTransferNetwork: ModalComponent<
  EditProviderDefaultTransferNetworkProps
> = ({ defaultNetworkName, resource, ...rest }) => {
  const { t } = useForkliftTranslation();

  const [value, setValue] = useState<string | number>(defaultNetworkName ?? 0);

  if (resource?.spec?.type !== PROVIDER_TYPES.openshift) {
    return null;
  }

  return (
    <ModalForm
      title={t('Set default Transfer Network')}
      onConfirm={async () => onConfirmProviderDefaultTransferNetwork({ resource, value })}
      {...rest}
    >
      <Stack hasGutter>
        {t(
          `You can select a default migration network for an OpenShift Virtualization provider in the Red Hat OpenShift web console to improve performance.
        The default migration network is used to transfer disks to the namespaces in which it is configured.If you do not select a migration network,
        the default migration network is the pod network, which might not be optimal for disk transfer.`,
        )}
        <FormGroupWithHelpText
          label={t('Default transfer Network')}
          helperText={t('Please choose a NetworkAttachmentDefinition for default data transfer.')}
        >
          <ProviderDefaultTransferNetworkDropdown
            provider={resource}
            value={value}
            onChange={setValue}
          />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditProviderDefaultTransferNetwork;
