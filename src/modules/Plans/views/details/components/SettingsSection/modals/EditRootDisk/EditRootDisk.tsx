import type { FC } from 'react';
import { FilterableSelect } from 'src/components/FilterableSelect/FilterableSelect';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { type Modify, PlanModel, type V1beta1Plan } from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem, Text } from '@patternfly/react-core';

import { editRootDiskModalAlert } from './editRootDiskModalAlert';
import { editRootDiskModalBody } from './editRootDiskModalBody';
import { diskOptions, getRootDiskLabelByKey } from './getRootDiskLabelByKey';

const onConfirm: OnConfirmHookType = async ({ model, newValue, resource }) => {
  const plan = resource as V1beta1Plan;

  const resourceValue = plan?.spec?.vms;
  const op = resourceValue ? 'replace' : 'add';
  const newVMs = resourceValue.map((vm) => ({
    ...vm,
    rootDisk: newValue || undefined,
  }));

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/vms',
        value: newVMs || undefined,
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

const RootDiskInputFactory: () => ModalInputComponentType = () => {
  const DropdownRenderer: FC<DropdownRendererProps> = ({ onChange, value }) => {
    const { t } = useForkliftTranslation();
    const options = diskOptions();

    const dropdownItems = options.map((option) => ({
      children: (
        <>
          <Text>{getRootDiskLabelByKey(option.key)}</Text>
          {option.description && (
            <HelperText>
              <HelperTextItem variant="indeterminate">{option.description}</HelperTextItem>
            </HelperText>
          )}
        </>
      ),
      itemId: option.key,
    }));

    return (
      <FilterableSelect
        selectOptions={dropdownItems}
        value={value as string}
        onSelect={onChange}
        canCreate
        placeholder={t('First root device')}
        createNewOptionLabel={t('Custom path:')}
      ></FilterableSelect>
    );
  };

  return DropdownRenderer;
};

export const EditRootDisk: FC<EditRootDiskProps> = (props) => {
  const { t } = useForkliftTranslation();

  const plan = props.resource;
  const rootDisk = plan.spec.vms?.[0]?.rootDisk;
  const allVMsHasMatchingRootDisk = plan.spec.vms.every((vm) => vm?.rootDisk === rootDisk);

  return (
    <EditModal
      {...props}
      jsonPath={(obj: V1beta1Plan) => obj?.spec?.vms?.[0]?.rootDisk}
      title={props?.title || t('Edit root device')}
      label={props?.label || t('Root device')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={
        <>
          {editRootDiskModalBody}
          {!allVMsHasMatchingRootDisk && editRootDiskModalAlert}
        </>
      }
      InputComponent={RootDiskInputFactory()}
    />
  );
};

type EditRootDiskProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Plan;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;
