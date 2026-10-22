import type { V1beta1Migration, V1beta1MigrationSpec } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { VMCutoverCellRenderer } from '../VMCutoverCellRenderer';

const VM_ID = 'vm-1000';
const PLAN_CUTOVER = '2030-10-20T10:00:00.000Z';
const VM_CUTOVER = '2030-10-21T18:30:00.000Z';
const INHERITED_LABEL = '(Inherited from plan)';

const renderCell = (spec: Partial<V1beta1MigrationSpec>): void => {
  render(
    <VMCutoverCellRenderer migration={{ spec } as unknown as V1beta1Migration} vmId={VM_ID} />,
  );
};

describe('VMCutoverCellRenderer', () => {
  it('marks a VM that is inheriting the plan-wide cutover', () => {
    renderCell({ cutover: PLAN_CUTOVER });

    expect(screen.getByText(INHERITED_LABEL)).toBeInTheDocument();
  });

  it('does not mark a VM that has its own override', () => {
    renderCell({ cutover: PLAN_CUTOVER, vmCutover: [{ cutover: VM_CUTOVER, id: VM_ID }] });

    expect(screen.queryByText(INHERITED_LABEL)).not.toBeInTheDocument();
  });
});
