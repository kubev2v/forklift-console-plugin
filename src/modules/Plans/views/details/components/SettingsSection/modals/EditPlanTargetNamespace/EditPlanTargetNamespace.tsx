import type { FC } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import {
  type Modify,
  type OpenShiftNetworkAttachmentDefinition,
  PlanModel,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Text } from '@patternfly/react-core';

const onConfirm: OnConfirmHookType = async ({ model, newValue, resource }) => {
  const plan = resource as V1beta1Plan;

  const targetNamespace = plan?.spec?.targetNamespace;
  const op = targetNamespace ? 'replace' : 'add';

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/targetNamespace',
        value: newValue ?? undefined,
      },
    ],
    model,
    resource,
  });

  return obj;
};

type DropdownRendererProps = {
  value: string | number;
  onChange: (val: string) => void;
};

const OpenshiftNamespaceInputFactory: ({ resource }) => ModalInputComponentType = ({
  resource,
}) => {
  const provider = resource as V1beta1Provider;

  const DropdownRenderer: FC<DropdownRendererProps> = ({ onChange, value }) => {
    const { t } = useForkliftTranslation();

    const { inventory: namespaces } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
      provider,
      subPath: 'namespaces?detail=4',
    });

    const options: string[] = (namespaces || []).map(
      (namespace) => namespace?.object?.metadata?.name,
    );

    const dropdownItems = (options || []).map((item) => ({
      children: <Text>{item}</Text>,
      itemId: item,
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

const EditPlanTargetNamespace_: FC<EditPlanTargetNamespaceProps> = (props) => {
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

type EditPlanTargetNamespaceProps = Modify<
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

export const EditPlanTargetNamespace: FC<EditPlanTargetNamespaceProps> = (props) => {
  return <EditPlanTargetNamespace_ {...props} />;
};
