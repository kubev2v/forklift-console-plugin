import type { EditModalProps } from 'src/modules/Providers/modals/EditModal/types';

import type { Modify, V1beta1Plan } from '@kubev2v/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export type SettingsEditModalProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Plan;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

export type SettingsDetailsItemProps = {
  canPatch: boolean;
  plan: V1beta1Plan;
  shouldRender?: boolean;
};
