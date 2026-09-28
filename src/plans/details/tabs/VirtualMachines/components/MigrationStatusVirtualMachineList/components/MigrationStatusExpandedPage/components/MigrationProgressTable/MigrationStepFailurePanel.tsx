import { type FC, useMemo, useState } from 'react';
import { Link } from 'react-router';

import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { Alert, ExpandableSection, Spinner, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { usePodLogTail } from '../../../../hooks/usePodLogTail';
import { getMigrationLogPod, getVirtV2vContainerName } from '../../../../utils/getMigrationLogPod';
import { getPodLogsConsolePath } from '../../../../utils/getPodLogsConsolePath';
import { getVmErrorPhaseLabel } from '../../../../utils/getVmErrorPhaseLabel';
import { isMigrationLogLineHighlighted } from '../../../../utils/isMigrationLogLineHighlighted';

import './MigrationStepFailurePanel.scss';

type MigrationStepFailurePanelProps = {
  pipelineStepName?: string;
  pods?: IoK8sApiCoreV1Pod[];
  reasons?: string[];
  vmErrorPhase?: string;
};

const MigrationStepFailurePanel: FC<MigrationStepFailurePanelProps> = ({
  pipelineStepName,
  pods,
  reasons,
  vmErrorPhase,
}) => {
  const { t } = useForkliftTranslation();
  const [logExpanded, setLogExpanded] = useState(false);

  const logPod = useMemo(
    () => getMigrationLogPod(pipelineStepName, pods),
    [pipelineStepName, pods],
  );
  const logContainer = logPod ? getVirtV2vContainerName(logPod) : undefined;
  const {
    error: logError,
    loaded: logLoaded,
    loading: logLoading,
    loadLogs,
    logText,
  } = usePodLogTail(logPod);

  const phaseLabel = getVmErrorPhaseLabel(vmErrorPhase);
  const title = reasons?.[0] ?? t('Error details');
  const bodyReasons = reasons && reasons.length > 1 ? reasons.slice(1) : undefined;

  const logLines = useMemo(() => (logText ? logText.split('\n') : []), [logText]);

  return (
    <div className="migration-step-failure-panel pf-v6-u-mt-sm">
      <Alert isInline title={title} variant="danger">
        <Stack hasGutter>
          {phaseLabel && (
            <StackItem>
              {t('Failure phase')}: {phaseLabel}
            </StackItem>
          )}
          {bodyReasons?.map((reason) => (
            <StackItem key={reason}>{reason}</StackItem>
          ))}
          {!logPod && (
            <StackItem>
              {t(
                'No migration pod was created for this step. Details are limited to the error above.',
              )}
            </StackItem>
          )}
          {logPod && (
            <>
              <StackItem>
                <ExpandableSection
                  isExpanded={logExpanded}
                  onToggle={(_event, expanded) => {
                    setLogExpanded(expanded);
                    if (expanded && !logLoaded) {
                      loadLogs();
                    }
                  }}
                  toggleText={
                    logExpanded
                      ? t('Hide conversion log excerpt')
                      : t('Show conversion log excerpt')
                  }
                >
                  {logLoading && <Spinner size="md" />}
                  {logLoaded && logError && (
                    <>
                      {t(
                        'Could not load pod logs. Use the link below to open logs in the console.',
                      )}
                    </>
                  )}
                  {logLoaded && !logError && !isEmpty(logLines) && (
                    <pre className="migration-step-failure-panel__log-pre">
                      {logLines.map((line) => (
                        <span
                          className={
                            isMigrationLogLineHighlighted(line)
                              ? 'migration-step-failure-panel__log-line--highlight'
                              : undefined
                          }
                          key={line}
                        >
                          {line}
                          {'\n'}
                        </span>
                      ))}
                    </pre>
                  )}
                </ExpandableSection>
              </StackItem>
              <StackItem>
                <Link to={getPodLogsConsolePath(logPod, logContainer)}>
                  {t('View full conversion logs')}
                </Link>
              </StackItem>
            </>
          )}
        </Stack>
      </Alert>
    </div>
  );
};

export default MigrationStepFailurePanel;
