import type { FC } from 'react';

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
        An error occurred while fetching target projects for target provider{' '}
        <strong>{targetProviderName}</strong>.
        <br />
        {error.message}
      </ForkliftTrans>
    );
  }

  return (
    <ForkliftTrans>
      Target provider <strong>{targetProviderName}</strong> does not have network mappings available
      in any existing projects.
      <br />
      Create a project or select a different target provider.
    </ForkliftTrans>
  );
};

export default TargetProjectEmptyState;
