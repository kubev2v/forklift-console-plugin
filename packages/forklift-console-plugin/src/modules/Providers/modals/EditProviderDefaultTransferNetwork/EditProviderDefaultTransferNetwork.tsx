import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Modify,
  OpenShiftNetworkAttachmentDefinition,
  ProviderModel,
  V1beta1Provider,
} from '@kubev2v/types';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';

import { useProviderInventory, useToggle } from '../../hooks';
import {
  EditModal,
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from '../EditModal';

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
const onConfirm: OnConfirmHookType = async ({ resource, model, newValue: value }) => {
  const currentAnnotations = resource?.metadata?.annotations;
  const newAnnotations = {
    ...currentAnnotations,
    'forklift.konveyor.io/defaultTransferNetwork': value || undefined,
  };

  const op = resource?.metadata?.annotations ? 'replace' : 'add';

  const obj = await k8sPatch({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: '/metadata/annotations',
        value: newAnnotations,
      },
    ],
  });

  return obj;
};

interface DropdownRendererProps {
  value: string | number;
  onChange: (string) => void;
}

const OpenshiftNetworksInputFactory: ({ resource }) => ModalInputComponentType = ({
  resource: provider,
}) => {
  const DropdownRenderer: React.FC<DropdownRendererProps> = ({ value, onChange }) => {
    const [isOpen, onToggle] = useToggle(false);
    const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
      provider,
      // eslint-disable-next-line @cspell/spellchecker
      subPath: 'networkattachmentdefinitions?detail=4',
    });

    const name = getNetworkName(value);

    const dropdownItems = [
      <DropdownItem
        key={'Pod network'}
        description={'Default pod network'}
        onClick={() => onChange('')}
      >
        {'Pod network'}
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

const EditProviderDefaultTransferNetwork_: React.FC<EditProviderDefaultTransferNetworkProps> = (
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
function getNetworkName(value: string | number): string {
  if (!value || typeof value !== 'string') {
    return 'Pod network';
  }

  const parts = value.split('/');
  return parts[parts.length - 1];
}

export type EditProviderDefaultTransferNetworkProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

export const EditProviderDefaultTransferNetwork: React.FC<
  EditProviderDefaultTransferNetworkProps
> = (props) => {
  if (props.resource?.spec?.type !== 'openshift') {
    return <></>;
  }

  return <EditProviderDefaultTransferNetwork_ {...props} />;
};
