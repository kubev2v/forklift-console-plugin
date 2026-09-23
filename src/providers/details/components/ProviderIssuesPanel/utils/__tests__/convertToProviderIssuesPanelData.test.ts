import type { K8sResourceCondition } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import { convertToProviderIssuesPanelData } from '../convertToProviderIssuesPanelData';

describe('convertToProviderIssuesPanelData', () => {
  it('maps condition severity, type, and message', () => {
    const conditions = [
      {
        category: CATEGORY_TYPES.WARNING,
        message: 'TLS verification skipped',
        status: CONDITION_STATUS.TRUE,
        type: 'ConnectionInsecure',
      },
    ] as unknown as K8sResourceCondition[];

    const rows = convertToProviderIssuesPanelData(conditions);

    expect(rows).toEqual([
      {
        condition: {
          message: 'TLS verification skipped',
          severity: CATEGORY_TYPES.WARNING,
          type: 'ConnectionInsecure',
        },
      },
    ]);
  });
});
