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
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';

const onConfirm: OnConfirmHookType = async ({ resource, model, newValue }) => {
  const plan = resource as V1beta1Plan;

  const targetNamespace = plan?.spec?.targetNamespace;
  const op = targetNamespace ? 'replace' : 'add';

  const obj = await k8sPatch({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: '/spec/targetNamespace',
        value: newValue || undefined,
      },
    ],
  });

  return obj;
};

interface DropdownRendererProps {
  value: string | number;
  onChange: (string) => void;
}

const OpenshiftNamespaceInputFactory: ({ resource }) => ModalInputComponentType = ({
  resource,
}) => {
  const provider = resource as V1beta1Provider;

  const DropdownRenderer: React.FC<DropdownRendererProps> = ({ value, onChange }) => {
    const [isOpen, onToggle] = useToggle(false);

    const { inventory: namespaces } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
      provider,
      // eslint-disable-next-line @cspell/spellchecker
      subPath: 'namespaces?detail=4',
    });

    const transferNetworks: string[] = (namespaces || []).map((n) => n?.object?.metadata?.name);

    const dropdownItems = [
      <DropdownItem key={''} description={'Undefined'} onClick={() => onChange('')}>
        {'No namespace selected'}
      </DropdownItem>,
      ...(transferNetworks || []).map((n) => (
        <DropdownItem key={n} description={`Namespace ${n}`} onClick={() => onChange(n)}>
          {n}
        </DropdownItem>
      )),
    ];

    return (
      <Dropdown
        onSelect={onToggle}
        toggle={
          <DropdownToggle id="select namespace" onToggle={onToggle}>
            {value}
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

const EditPlanTargetNamespace_: React.FC<EditPlanTargetNamespaceProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={['spec', 'targetNamespace']}
      title={props?.title || t('Edit migration plan target namespace')}
      label={props?.label || t('Target namespace')}
      helperText={t('Please choose a target namespace for the migrated virtual machines.')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={t(`You can select a migration target namespace for the migration virtual machines.`)}
      InputComponent={OpenshiftNamespaceInputFactory({ resource: props.destinationProvider })}
      validationHook={(newValue) => (newValue ? { type: 'default' } : { type: 'error' })}
    />
  );
};

export type EditPlanTargetNamespaceProps = Modify<
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

export const EditPlanTargetNamespace: React.FC<EditPlanTargetNamespaceProps> = (props) => {
  return <EditPlanTargetNamespace_ {...props} />;
};
