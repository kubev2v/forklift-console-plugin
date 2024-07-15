import React from 'react';
import {
  EditModal,
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Modify, PlanModel, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Switch } from '@patternfly/react-core';

const onConfirm: OnConfirmHookType = async ({ resource, model, newValue }) => {
  const plan = resource as V1beta1Plan;

  const resourceValue = plan?.spec?.preserveStaticIPs;
  const op = resourceValue ? 'replace' : 'add';

  const obj = await k8sPatch({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: '/spec/preserveStaticIPs',
        value: newValue === 'true' || undefined,
      },
    ],
  });

  return obj;
};

interface SwitchRendererProps {
  value: string | number;
  onChange: (string) => void;
}

const PreserveStaticIPsInputFactory: () => ModalInputComponentType = () => {
  const { t } = useForkliftTranslation();

  const SwitchRenderer: React.FC<SwitchRendererProps> = ({ value, onChange }) => {
    const onChangeInternal: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void = (
      checked,
    ) => {
      onChange(checked ? 'true' : 'false');
    };

    return (
      <Switch
        id="simple-switch"
        label={t(
          'Preserve the static IPs of VMs with Windows guest operating system from vSphere.',
        )}
        labelOff={t(
          'Do not try to preserve the static IPs of VMs with Windows guest operating system from vSphere.',
        )}
        isChecked={value === 'true'}
        onChange={onChangeInternal}
      />
    );
  };

  return SwitchRenderer;
};

const EditPlanPreserveStaticIPs_: React.FC<EditPlanPreserveStaticIPsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <EditModal
      {...props}
      jsonPath={(obj: V1beta1Plan) => (obj.spec.preserveStaticIPs ? 'true' : 'false')}
      title={props?.title || t('Set to preserve the static IPs')}
      label={props?.label || t('Whether to preserve the static IPs')}
      model={PlanModel}
      onConfirmHook={onConfirm}
      body={t(`Preserve the static IPs of VMs with Windows guest operating system from vSphere.`)}
      InputComponent={PreserveStaticIPsInputFactory()}
    />
  );
};

export type EditPlanPreserveStaticIPsProps = Modify<
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

export const EditPlanPreserveStaticIPs: React.FC<EditPlanPreserveStaticIPsProps> = (props) => {
  return <EditPlanPreserveStaticIPs_ {...props} />;
};
