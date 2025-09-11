import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { AffinityLabel } from './types';

export const isTermsInvalid = (terms: AffinityLabel[]) =>
  terms?.some(
    ({ key, operator, values }) =>
      !key ||
      ((operator === Operator.In.valueOf() || operator === Operator.NotIn.valueOf()) &&
        isEmpty(values)),
  );
