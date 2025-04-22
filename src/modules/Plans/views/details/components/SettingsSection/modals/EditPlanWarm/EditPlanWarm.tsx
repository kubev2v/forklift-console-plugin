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

  const targetWarm = plan?.spec?.warm;
  const op = targetWarm ? 'replace' : 'add';

  const obj = await k8sPatch({
    data: [
      {
        op,
        path: '/spec/warm',
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

const WarmInputFactory: () => ModalInputComponentType = () => {
  const SwitchRenderer: FC<SwitchRendererProps> = ({ onChange, value }) => {
    const onChangeInternal: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (
      checked,
    ) => {
      onChange(checked ? 'true' : 'false');
    };

    return (
      <Switch
        id="simple-switch"
        label="Warm migration, most of the data is copied during the precopy stage while the source virtual machines (VMs) are running."
        labelOff="Cold migration, the source virtual machines are shut down while the data is copied."
        isChecked={value === 'true'}
        onChange={(e, value) => {
          onChangeInternal(value, e);
        }}
      />
    );
  };

  return SwitchRenderer;
};

const EditPlanWarm_: FC<EditPlanWarmProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={(obj: V1beta1Plan) => (obj.spec.warm ? 'true' : 'false')}
      title={props?.title || t('Set warm migration')}
      label={props?.label || t('Whether this is a warm migration')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={t(
        `In warm migration, the VM disks are copied incrementally using changed block tracking (CBT) snapshots.
        The snapshots are created at one-hour intervals by default.
        You can change the snapshot interval by updating the forklift-controller deployment.`,
      )}
      InputComponent={WarmInputFactory()}
    />
  );
};

type EditPlanWarmProps = Modify<
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

export const EditPlanWarm: FC<EditPlanWarmProps> = (props) => {
  return <EditPlanWarm_ {...props} />;
};
