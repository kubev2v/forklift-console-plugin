import React from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import {
  Modify,
  OpenShiftNetworkAttachmentDefinition,
  PlanModel,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Text } from '@patternfly/react-core';

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
    const { t } = useForkliftTranslation();

    const { inventory: namespaces } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
      provider,
      subPath: 'namespaces?detail=4',
    });

    const options: string[] = (namespaces || []).map((n) => n?.object?.metadata?.name);

    const dropdownItems = (options || []).map((n) => ({
      itemId: n,
      children: <Text>{n}</Text>,
    }));

    return (
      <FilterableSelect
        selectOptions={dropdownItems}
        value={value as string}
        onSelect={onChange}
        canCreate
        placeholder={t('No namespace selected')}
      ></FilterableSelect>
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
