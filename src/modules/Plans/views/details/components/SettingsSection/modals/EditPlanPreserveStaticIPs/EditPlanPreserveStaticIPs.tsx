import React from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import {
  EditModalProps,
  ModalInputComponentType,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
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
        id="preserve-static-ip-switch"
        label={t('Preserve the static IPs of the virtual machines migrated')}
        isChecked={value === 'true'}
        hasCheckIcon
        onChange={(e, v) => onChangeInternal(v, e)}
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
      label={props?.label ?? ''}
      model={PlanModel}
      onConfirmHook={onConfirm}
      InputComponent={PreserveStaticIPsInputFactory()}
    />
  );
};

type EditPlanPreserveStaticIPsProps = Modify<
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
