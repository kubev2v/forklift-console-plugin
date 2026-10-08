import { type FC, type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { ExpandableSection, Spinner, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { usePodLogTail } from '../../../../hooks/usePodLogTail';
import { buildMigrationLogLineEntries } from '../../../../utils/buildMigrationLogLineEntries';
import { getVirtV2vContainerName } from '../../../../utils/getMigrationLogPod';
import { getPodLogsConsolePath } from '../../../../utils/getPodLogsConsolePath';
import { isMigrationLogLineHighlighted } from '../../../../utils/isMigrationLogLineHighlighted';

type MigrationStepConversionLogSectionProps = {
  logPod: IoK8sApiCoreV1Pod;
};

const MigrationStepConversionLogSection: FC<MigrationStepConversionLogSectionProps> = ({
  logPod,
}) => {
  const { t } = useForkliftTranslation();
  const [logExpanded, setLogExpanded] = useState(false);
  const logContainer = getVirtV2vContainerName(logPod);
  const { error: logError, loaded: logLoaded, loadLogs, logText } = usePodLogTail(logPod);

  useEffect(() => {
    if (logExpanded && !logLoaded) {
      loadLogs();
    }
  }, [loadLogs, logExpanded, logLoaded]);

  const logLineEntries = useMemo(() => buildMigrationLogLineEntries(logText), [logText]);

  let logExcerptContent: ReactNode = null;
  if (logLoaded) {
    if (logError) {
      logExcerptContent = t(
        'Could not load pod logs. Use the link below to open logs in the console.',
      );
    } else if (!isEmpty(logLineEntries)) {
      logExcerptContent = (
        <pre className="migration-step-failure-panel__log-pre">
          {logLineEntries.map(({ key, line }) => (
            <div
              className={
                isMigrationLogLineHighlighted(line)
                  ? 'migration-step-failure-panel__log-line--highlight'
                  : undefined
              }
              key={key}
            >
              {line}
            </div>
          ))}
        </pre>
      );
    }
  } else {
    logExcerptContent = <Spinner size="md" />;
  }

  return (
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
            logExpanded ? t('Hide conversion log excerpt') : t('Show conversion log excerpt')
          }
        >
          {logExcerptContent}
        </ExpandableSection>
      </StackItem>
      <StackItem>
        <Link to={getPodLogsConsolePath(logPod, logContainer)}>
          {t('View full conversion logs')}
        </Link>
      </StackItem>
    </>
  );
};

export default MigrationStepConversionLogSection;
