import type { FC, FormEvent } from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { type Modify, PlanModel, type V1beta1Plan, type V1beta1Provider } from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Switch } from '@patternfly/react-core';

const onConfirm: OnConfirmHookType = async ({ model, newValue, resource }) => {
  const plan = resource as V1beta1Plan;

  const resourceValue = plan?.spec?.preserveClusterCpuModel;
  const op = resourceValue ? 'replace' : 'add';

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/preserveClusterCpuModel',
        value: newValue === 'true' || undefined,
      },
    ],
    model,
    resource,
  });

  return obj;
};

type SwitchRendererProps = {
  value: string | number;
  onChange: (string) => void;
};

const PreserveClusterCpuModelInputFactory: () => ModalInputComponentType = () => {
  const SwitchRenderer: FC<SwitchRendererProps> = ({ onChange, value }) => {
    const onChangeInternal: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (
      checked,
    ) => {
      onChange(checked ? 'true' : 'false');
    };

    return (
      <Switch
        id="simple-switch"
        label="Preserve the CPU model and flags the VM runs with in its oVirt cluster."
        labelOff="Do not try to preserve the CPU model and flags the VM runs with in its oVirt cluster."
        isChecked={value === 'true'}
        onChange={(e, value) => {
          onChangeInternal(value, e);
        }}
      />
    );
  };

  return SwitchRenderer;
};

const EditPlanPreserveClusterCpuModel_: FC<EditPlanPreserveClusterCpuModelProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={(obj: V1beta1Plan) => (obj.spec.preserveClusterCpuModel ? 'true' : 'false')}
      title={props?.title || t('Set to preserve the CPU model')}
      label={props?.label || t('Whether to preserve the CPU model')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={t(`Preserve the CPU model and flags the VM runs with in its oVirt cluster.`)}
      InputComponent={PreserveClusterCpuModelInputFactory()}
    />
  );
};

type EditPlanPreserveClusterCpuModelProps = Modify<
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

export const EditPlanPreserveClusterCpuModel: FC<EditPlanPreserveClusterCpuModelProps> = (
  props,
) => {
  return <EditPlanPreserveClusterCpuModel_ {...props} />;
};
