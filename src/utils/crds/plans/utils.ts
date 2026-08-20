import { PlanModelRef, type V1beta1Plan } from '@forklift-ui/types';
import { getResourceUrl } from '@utils/getResourceUrl';

import { getName, getNamespace } from '../common/selectors';

export const getPlanURL = (plan: V1beta1Plan): string =>
  getResourceUrl({
    name: getName(plan),
    namespace: getNamespace(plan),
    reference: PlanModelRef,
  });
