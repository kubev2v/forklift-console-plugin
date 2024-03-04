import React from 'react';
import { useProviderInventory, useToggle } from 'src/modules/Providers/hooks';
import {
  EditModal,
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Modify,
  OpenShiftNetworkAttachmentDefinition,
  PlanModel,
  ProviderModelGroupVersionKind,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';
import { K8sModel, k8sPatch, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';

const onConfirm: OnConfirmHookType = async ({ resource, model, newValue: value }) => {
  const plan = resource as V1beta1Plan;

  const transferNetwork = plan?.spec?.transferNetwork;

  const op = transferNetwork ? 'replace' : 'add';

  const obj = await k8sPatch({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: '/spec/transferNetwork',
        value: value,
      },
    ],
  });

  return obj;
};

interface DropdownRendererProps {
  value: string | number;
  onChange: (string) => void;
}

const OpenshiftNetworksInputFactory: ({ resource }) => ModalInputComponentType = ({ resource }) => {
  const DropdownRenderer: React.FC<DropdownRendererProps> = ({ value, onChange }) => {
    const [isOpen, onToggle] = useToggle(false);

    const plan = resource as V1beta1Plan;
    const [provider] = useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: true,
      namespaced: true,
      namespace: plan.spec.provider.destination.namespace,
      name: plan.spec.provider.destination.name,
    });

    const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
      provider,
      // eslint-disable-next-line @cspell/spellchecker
      subPath: 'networkattachmentdefinitions?detail=4',
    });

    const name = getNetworkName(value);

    const dropdownItems = [
      <DropdownItem
        key={'Providers default'}
        description={'Use the providers default transfer network'}
        onClick={() => onChange('')}
      >
        {'Providers default'}
      </DropdownItem>,
      ...(networks || []).map((n) => (
        <DropdownItem
          key={n.name}
          description={n.namespace}
          onClick={() => onChange(`${n.namespace}/${n.name}`)}
        >
          {n.name}
        </DropdownItem>
      )),
    ];

    return (
      <Dropdown
        onSelect={onToggle}
        toggle={
          <DropdownToggle id="select network" onToggle={onToggle}>
            {name}
          </DropdownToggle>
        }
        isOpen={isOpen}
        dropdownItems={dropdownItems}
        menuAppendTo="parent"
      />
    );
  };

  return DropdownRenderer;
};

const EditPlanTransferNetwork_: React.FC<EditPlanTransferNetworkProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={['spec', 'transferNetwork']}
      title={props?.title || t('Edit migration plan transfer network')}
      label={props?.label || t('Transfer Network')}
      helperText={t('Please choose a NetworkAttachmentDefinition for data transfer.')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={t(
        `You can select a migration network. If you do not select a migration network,
        the default migration network is set to the providers default transfer network.`,
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
function getNetworkName(value: string | number): string {
  if (!value || typeof value !== 'string') {
    return 'Pod network';
  }

  const parts = value.split('/');
  return parts[parts.length - 1];
}

export type EditPlanTransferNetworkProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Plan;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

export const EditPlanTransferNetwork: React.FC<EditPlanTransferNetworkProps> = (props) => {
  return <EditPlanTransferNetwork_ {...props} />;
};
