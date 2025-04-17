import { PlanModelRef, type V1beta1Plan } from '@kubev2v/types';

import { getResourceUrl } from '../../../modules/Providers/utils/helpers/getResourceUrl';
import { getName, getNamespace } from '../common/selectors';

export const getPlanURL = (plan: V1beta1Plan) =>
  getResourceUrl({
    name: getName(plan),
    namespace: getNamespace(plan),
    reference: PlanModelRef,
  });
