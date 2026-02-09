import { useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { DEFAULT_TRANSFER_NETWORK_ANNOTATION, PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ProviderModel, type V1beta1Provider } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, Stack, StackItem } from '@patternfly/react-core';

import NetworkDropdown from './components/NetworkDropdown';

export type EditProviderDefaultTransferNetworkProps = {
  resource: V1beta1Provider;
};

const EditProviderDefaultTransferNetwork: ModalComponent<
  EditProviderDefaultTransferNetworkProps
> = ({ closeModal, resource: provider }) => {
  const { t } = useForkliftTranslation();

  const initialValue =
    provider?.metadata?.annotations?.[DEFAULT_TRANSFER_NETWORK_ANNOTATION as string] ?? '';
  const [value, setValue] = useState(initialValue);

  if (provider?.spec?.type !== PROVIDER_TYPES.openshift) {
    return null;
  }

  const onConfirm = async (): Promise<void> => {
    const currentAnnotations = provider?.metadata?.annotations;
    const newAnnotations = {
      ...currentAnnotations,
      [DEFAULT_TRANSFER_NETWORK_ANNOTATION]: value || undefined,
    };

    const op = provider?.metadata?.annotations ? REPLACE : ADD;

    await k8sPatch({
      data: [
        {
          op,
          path: '/metadata/annotations',
          value: newAnnotations,
        },
      ],
      model: ProviderModel,
      resource: provider,
    });
  };

  return (
    <ModalForm
      closeModal={closeModal}
      title={t('Edit default transfer network')}
      onConfirm={onConfirm}
    >
      <Stack hasGutter>
        <StackItem>
          {t(
            `You can select a default migration network for an OpenShift Virtualization provider in the Red Hat OpenShift web console to improve performance.
            The default migration network is used to transfer disks to the namespaces in which it is configured.If you do not select a migration network,
            the default migration network is the pod network, which might not be optimal for disk transfer.`,
          )}
        </StackItem>
        <StackItem>
          <Form>
            <FormGroupWithHelpText
              label={t('Default transfer network')}
              fieldId="transfer-network-input"
              helperText={t(
                'Please choose a NetworkAttachmentDefinition for default data transfer.',
              )}
            >
              <NetworkDropdown provider={provider} value={value} onChange={setValue} />
            </FormGroupWithHelpText>
          </Form>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default EditProviderDefaultTransferNetwork;
