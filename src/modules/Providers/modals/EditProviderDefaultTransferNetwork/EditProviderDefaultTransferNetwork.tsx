import { type FC, type MouseEvent, type Ref, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  type Modify,
  type OpenShiftNetworkAttachmentDefinition,
  ProviderModel,
  type V1beta1Provider,
} from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';

import useProviderInventory from '../../hooks/useProviderInventory';
import { EditModal } from '../EditModal/EditModal';
import type {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from '../EditModal/types';

/**
 * Handles the confirmation action for editing a resource annotations.
 * Adds or updates the 'forklift.konveyor.io/defaultTransferNetwork' annotation in the resource's metadata.
 *
 * @param {Object} options - Options for the confirmation action.
 * @param {Object} options.resource - The resource to be modified.
 * @param {Object} options.model - The model associated with the resource.
 * @param {any} options.newValue - The new value for the 'forklift.konveyor.io/defaultTransferNetwork' annotation.
 * @returns {Promise<Object>} - The modified resource.
 */
const onConfirm: OnConfirmHookType = async ({ model, newValue: value, resource }) => {
  const currentAnnotations = resource?.metadata?.annotations;
  const newAnnotations = {
    ...currentAnnotations,
    'forklift.konveyor.io/defaultTransferNetwork': value || undefined,
  };

  const op = resource?.metadata?.annotations ? 'replace' : 'add';

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/metadata/annotations',
        value: newAnnotations,
      },
    ],
    model,
    resource,
  });

  return obj;
};

type DropdownRendererProps = {
  value: string | number;
  onChange: (string) => void;
};

const OpenshiftNetworksInputFactory: ({ resource }) => ModalInputComponentType = ({
  resource: provider,
}) => {
  const DropdownRenderer: FC<DropdownRendererProps> = ({ onChange, value }) => {
    // Hook for managing the open/close state of the dropdown
    const [isOpen, setIsOpen] = useState(false);

    const onToggleClick = () => {
      setIsOpen((isOpen) => !isOpen);
    };

    const onSelect = (_event: MouseEvent | undefined, _value: string | number | undefined) => {
      setIsOpen(false);
    };

    const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
      provider,
      subPath: 'networkattachmentdefinitions?detail=4',
    });

    const name = getNetworkName(value);

    const dropdownItems = [
      <DropdownItem
        value={0}
        key="Pod network"
        description={'Default pod network'}
        onClick={() => {
          onChange('');
        }}
      >
        {'Pod network'}
      </DropdownItem>,
      ...(networks || []).map((network) => (
        <DropdownItem
          value={1}
          key={network.name}
          description={network.namespace}
          onClick={() => {
            onChange(`${network.namespace}/${network.name}`);
          }}
        >
          {network.name}
        </DropdownItem>
      )),
    ];

    return (
      <Dropdown
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSelect={onSelect}
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isOpen}
            variant={'default'}
          >
            {name}
          </MenuToggle>
        )}
        shouldFocusToggleOnSelect
        popperProps={{
          position: 'right',
        }}
        isScrollable={true}
      >
        <DropdownList>{dropdownItems}</DropdownList>
      </Dropdown>
    );
  };

  return DropdownRenderer;
};

const EditProviderDefaultTransferNetwork_: FC<EditProviderDefaultTransferNetworkProps> = (
  props,
) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={['metadata', 'annotations', 'forklift.konveyor.io/defaultTransferNetwork']}
      title={props?.title || t('Edit Default Transfer Network')}
      label={props?.label || t('Default Transfer Network')}
      helperText={t('Please choose a NetworkAttachmentDefinition for default data transfer.')}
      model={ProviderModel}
      onConfirmHook={onConfirm}
      body={t(
        `You can select a default migration network for an OpenShift Virtualization provider in the Red Hat OpenShift web console to improve performance.
        The default migration network is used to transfer disks to the namespaces in which it is configured.If you do not select a migration network,
        the default migration network is the pod network, which might not be optimal for disk transfer.`,
      )}
      InputComponent={OpenshiftNetworksInputFactory({ resource: props.resource })}
    />
  );
};

/**
 * Extracts the network name from a string. The input string can be of the form 'name' or 'namespace/name'.
 *
 * @param {string} value - The input string from which the network name is to be extracted.
 * @returns {string} The network name extracted from the input string.
 */
const getNetworkName = (value: string | number): string => {
  if (!value || typeof value !== 'string') {
    return 'Pod network';
  }

  const parts = value.split('/');

  return parts[parts.length - 1];
};

type EditProviderDefaultTransferNetworkProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

export const EditProviderDefaultTransferNetwork: FC<EditProviderDefaultTransferNetworkProps> = (
  props,
) => {
  if (props.resource?.spec?.type !== 'openshift') {
    return <></>;
  }

  return <EditProviderDefaultTransferNetwork_ {...props} />;
};
