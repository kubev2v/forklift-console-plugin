import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { ForkliftTrans } from '@utils/i18n';

type TargetProjectEmptyStateProps = {
  targetProviderName: string;
  error?: Error | null;
};
const TargetProjectEmptyState: FC<TargetProjectEmptyStateProps> = ({
  error,
  targetProviderName,
}) => {
  if (error?.message) {
    return (
      <ForkliftTrans>
        <Stack hasGutter>
          <StackItem>
            An error occurred while fetching target projects for target provider{' '}
            <strong>{targetProviderName}</strong>.
          </StackItem>
          <StackItem>{error.message}</StackItem>
        </Stack>
      </ForkliftTrans>
    );
  }

  return (
    <ForkliftTrans>
      <Stack hasGutter>
        <StackItem>
          Target provider <strong>{targetProviderName}</strong> does not have network mappings
          available in any existing projects.
        </StackItem>
        <StackItem>Create a project or select a different target provider.</StackItem>
      </Stack>
    </ForkliftTrans>
  );
};

export default TargetProjectEmptyState;
