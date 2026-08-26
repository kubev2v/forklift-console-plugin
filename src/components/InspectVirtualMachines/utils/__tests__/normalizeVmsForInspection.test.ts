import { INSPECTION_STATUS } from '@utils/crds/conversion/constants';

import { normalizeVmsForInspection } from '../normalizeVmsForInspection';

describe('normalizeVmsForInspection', () => {
  it('maps missing fields to defaults', () => {
    const rows = normalizeVmsForInspection([{}], () => undefined);

    expect(rows).toEqual([
      {
        id: '',
        inspectionStatus: INSPECTION_STATUS.NOT_INSPECTED,
        isActive: false,
        name: '',
        timestamp: undefined,
      },
    ]);
  });

  it('uses name fallback to id and inspection status from getter', () => {
    const rows = normalizeVmsForInspection([{ id: 'vm-1' }], () => ({
      lastRun: '2024-01-01T00:00:00Z',
      status: INSPECTION_STATUS.RUNNING,
      conversion: { status: { phase: 'Running' } },
    }));

    expect(rows[0]).toMatchObject({
      id: 'vm-1',
      inspectionStatus: INSPECTION_STATUS.RUNNING,
      isActive: true,
      name: 'vm-1',
      timestamp: '2024-01-01T00:00:00Z',
    });
  });

  it('marks inactive when conversion is missing or completed', () => {
    const inactive = normalizeVmsForInspection([{ id: 'a', name: 'A' }], () => ({
      status: INSPECTION_STATUS.INSPECTION_PASSED,
      conversion: { status: { phase: 'Succeeded' } },
    }));

    expect(inactive[0].isActive).toBe(false);
  });
});
