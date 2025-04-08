import { type FC, type MouseEvent, type Ref, useState } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  type Modify,
  type OpenShiftNetworkAttachmentDefinition,
  PlanModel,
  type V1beta1Plan,
  type V1beta1PlanSpecTransferNetwork,
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

const onConfirm: OnConfirmHookType = async ({ model, newValue, resource }) => {
  const plan = resource as V1beta1Plan;

  const transferNetwork = plan?.spec?.transferNetwork;
  const op = transferNetwork ? 'replace' : 'add';

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/transferNetwork',
        value: newValue || undefined,
      },
    ],
    model,
    resource,
  });

  return obj;
};

type DropdownRendererProps = {
  value: string | number;
  onChange: (V1beta1PlanSpecTransferNetwork) => void;
};

const OpenshiftNetworksInputFactory: ({ resource }) => ModalInputComponentType = ({ resource }) => {
  const provider = resource as V1beta1Provider;

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

    const transferNetworks: V1beta1PlanSpecTransferNetwork[] = (networks || []).map((network) => ({
      apiVersion: network.object.apiVersion,
      kind: network.object.kind,
      name: network.name,
      namespace: network.namespace,
      uid: network.uid,
    }));

    const dropdownItems = [
      <DropdownItem
        value={0}
        key={''}
        description={'Use the providers default transfer network'}
        onClick={() => {
          onChange('');
        }}
      >
        {'Providers default'}
      </DropdownItem>,
      ...(transferNetworks || []).map((network) => (
        <DropdownItem
          value={1}
          key={getNetworkName(network)}
          description={network.namespace}
          onClick={() => {
            onChange(network);
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
            {getNetworkName(value)}
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

const EditPlanTransferNetwork_: FC<EditPlanTransferNetworkProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={getNetworkName}
      title={props?.title || t('Edit migration plan transfer network')}
      label={props?.label || t('Transfer Network')}
      helperText={t('Please choose a NetworkAttachmentDefinition for data transfer.')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={t(
        `You can select a migration network. If you do not select a migration network,
        the default migration network is set to the providers default transfer network.`,
      )}
      InputComponent={OpenshiftNetworksInputFactory({ resource: props.destinationProvider })}
    />
  );
};

/**
 * Extracts the network name from a string. The input string can be of the form 'name' or 'namespace/name'.
 *
 * @param {unknown} value - The input string from which the network name is to be extracted.
 * @returns {string} The network name extracted from the input string.
 */
const getNetworkName = (value: unknown): string => {
  if (!value || typeof value === 'string') {
    return 'Providers default';
  }

  return `${value?.namespace}/${value?.name}`;
};

type EditPlanTransferNetworkProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Plan;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
    destinationProvider: V1beta1Provider;
  }
>;

export const EditPlanTransferNetwork: FC<EditPlanTransferNetworkProps> = (props) => {
  return <EditPlanTransferNetwork_ {...props} />;
};
