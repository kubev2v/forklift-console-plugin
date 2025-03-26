import { EditModalProps } from 'src/modules/Providers/modals';

import { Modify, V1beta1ForkliftController } from '@kubev2v/types';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export type EditSettingsModalProps = Modify<
  EditModalProps,
  {
    resource: V1beta1ForkliftController;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;
