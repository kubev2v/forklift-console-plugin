import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { VirtualizationValidationExecution } from 'src/virtualizationValidation/types';

import ValidationCheckResultsTable from '../ValidationCheckResultsTable';

jest.mock('src/utils/i18n', () => ({
  useForkliftTranslation: () => ({ t: (key: string) => key }),
}));

const canaryWorkflow: VirtualizationValidationExecution = {
  checkId: 'canary/workflow',
  durationMilliseconds: 69000,
  name: 'Cluster canary workflow',
  outcome: 'Passed',
  severity: 'Required',
  steps: [
    { name: 'Start VM', outcome: 'Passed' },
    { name: 'Snapshot', outcome: 'Passed' },
  ],
};

describe('ValidationCheckResultsTable', () => {
  it('expands the workflow steps when requested', async () => {
    const user = userEvent.setup();

    render(<ValidationCheckResultsTable executions={[canaryWorkflow]} />);

    expect(screen.queryByText('Start VM')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Start VM')).toBeInTheDocument();
    expect(screen.getByText('Snapshot')).toBeInTheDocument();
  });

  it('expands a workflow with a non-passing step', () => {
    render(
      <ValidationCheckResultsTable
        executions={[
          {
            ...canaryWorkflow,
            steps: [
              { name: 'Start VM', outcome: 'Passed' },
              { name: 'Snapshot', outcome: 'TimedOut', reason: 'SnapshotTimedOut' },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText('Start VM')).toBeInTheDocument();
    expect(screen.getByText('SnapshotTimedOut')).toBeInTheDocument();
  });
});
