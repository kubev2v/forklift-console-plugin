import { EditModalProps } from 'src/modules/Providers/modals/EditModal/types';

import { Modify, V1beta1Plan, V1beta1PlanSpec, V1beta1PlanSpecVms } from '@kubev2v/types';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

type PlanNameTemplates = {
  pvcNameTemplate?: string;
  volumeNameTemplate?: string;
  networkNameTemplate?: string;
};

type EnhancedPlanSpecVms = V1beta1PlanSpecVms & PlanNameTemplates;

export type EnhancedPlan = V1beta1Plan & {
  spec: V1beta1PlanSpec &
    PlanNameTemplates & {
      migrateSharedDisks?: boolean;
      vms: EnhancedPlanSpecVms[];
    };
};

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
