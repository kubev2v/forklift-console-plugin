import type { K8sResourceCondition } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import { convertToProviderIssuesPanelData } from '../convertToProviderIssuesPanelData';

describe('convertToProviderIssuesPanelData', () => {
  it('maps condition fields and items count', () => {
    const conditions = [
      {
        category: CATEGORY_TYPES.WARNING,
        items: ['host-1', 'host-2'],
        message: 'TLS verification skipped',
        status: CONDITION_STATUS.TRUE,
        type: 'ConnectionInsecure',
      },
    ] as unknown as K8sResourceCondition[];

    const rows = convertToProviderIssuesPanelData(conditions, true, '/providers/test');

    expect(rows).toEqual([
      {
        condition: {
          itemsCount: 2,
          message: 'TLS verification skipped',
          severity: CATEGORY_TYPES.WARNING,
          type: 'ConnectionInsecure',
        },
        hasHostsTab: true,
        providerUrl: '/providers/test',
      },
    ]);
  });
});
