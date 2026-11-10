import type { FC } from 'react';
import { getNamespace } from 'src/utils/crds/common/selectors';
import { ForkliftTrans } from 'src/utils/i18n';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';
type ServiceAccountHelpTextProps = {
  isPreHook: boolean;
  plan?: V1beta1Plan;
};
export const ServiceAccountHelpText: FC<ServiceAccountHelpTextProps> = ({ isPreHook, plan }) => {
  const serviceAccountProject =
    (plan && (isPreHook ? getNamespace(plan) : getPlanTargetNamespace(plan))) ?? '';

  if (isPreHook) {
    return (
      <ForkliftTrans values={{ serviceAccountProject }}>
        Red Hat OpenShift service account. The service account is needed for manipulating any
        resources of the cluster. Note that the provided service account should be in the{' '}
        {{ serviceAccountProject }} plan's project.
      </ForkliftTrans>
    );
  }
  return (
    <ForkliftTrans values={{ serviceAccountProject }}>
      Red Hat OpenShift service account. The service account is needed for manipulating any
      resources of the cluster. Note that the provided service account should be in the{' '}
      {{ serviceAccountProject }} plan's target project.
    </ForkliftTrans>
  );
};
