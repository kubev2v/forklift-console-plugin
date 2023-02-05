import * as React from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import WarningTriangleIcon from '@patternfly/react-icons/dist/esm/icons/warning-triangle-icon';
import { MustGatherContext } from 'legacy/src/common/context';

interface IMustGatherBtn {
  displayName: string;
  type: 'plan' | 'vm';
  isCompleted?: boolean;
}

export const MustGatherBtn: React.FunctionComponent<IMustGatherBtn> = ({
  displayName,
  type,
  isCompleted,
}) => {
  const {
    setMustGatherModalOpen,
    setActiveMustGather,
    mustGathersQuery,
    withoutNs,
    withNs,
    latestAssociatedMustGather,
    downloadMustGatherResult,
    fetchMustGatherResult,
    notifyDownloadFailed,
  } = React.useContext(MustGatherContext);

  const namespacedName = withNs(displayName, type);
  const mustGather = latestAssociatedMustGather(namespacedName);

  return mustGather?.status === 'completed' && mustGather?.['archive-name'] ? (
    <Tooltip
      content={
        !mustGathersQuery?.isSuccess
          ? `Cannot reach must gather service.`
          : `must-gather-${type}_${displayName} available for download.`
      }
    >
      <Button
        aria-label={`Download logs for ${displayName}`}
        isAriaDisabled={!mustGathersQuery?.isSuccess}
        variant="secondary"
        onClick={() => {
          fetchMustGatherResult(mustGather)
            .then(
              (tarBall) => tarBall && downloadMustGatherResult(tarBall, mustGather['archive-name'])
            )
            .catch(() => notifyDownloadFailed());
        }}
      >
        Download logs
      </Button>
    </Tooltip>
  ) : (
    <Tooltip
      content={
        !isCompleted
          ? 'Cannot run must gather until the migration is finished.'
          : !mustGathersQuery?.isSuccess
          ? `Cannot reach must gather service.`
          : mustGather?.status === 'inprogress'
          ? `Collecting ${type === 'plan' ? 'migration plan' : 'VM migration'} logs.`
          : mustGather?.status === 'new'
          ? `Must gather queued for execution.`
          : mustGather?.status === 'error'
          ? `Cannot complete must gather for ${withoutNs(mustGather?.['custom-name'], type)}`
          : `Collects the current ${
              type === 'plan' ? 'migration plan' : 'VM migration'
            } logs and creates a tar archive file for download.`
      }
    >
      <Button
        icon={mustGather?.status === 'error' ? <WarningTriangleIcon /> : null}
        isLoading={
          !mustGathersQuery?.isError &&
          (mustGather?.status === 'inprogress' || mustGather?.status === 'new')
        }
        isAriaDisabled={
          mustGather?.status === 'inprogress' ||
          mustGather?.status === 'new' ||
          !mustGathersQuery?.isSuccess ||
          !isCompleted
        }
        variant="secondary"
        onClick={() => {
          setMustGatherModalOpen(true);
          setActiveMustGather({
            type,
            displayName: displayName,
            status: 'new',
          });
        }}
      >
        {mustGather?.status === 'completed' ? 'Download logs' : 'Get logs'}
      </Button>
    </Tooltip>
  );
};
