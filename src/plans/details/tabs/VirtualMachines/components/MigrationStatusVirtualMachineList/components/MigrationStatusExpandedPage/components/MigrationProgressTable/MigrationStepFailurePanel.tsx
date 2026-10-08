import type { FC } from 'react';

import type { IoK8sApiCoreV1Pod } from '@forklift-ui/types';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getMigrationLogPod } from '../../../../utils/getMigrationLogPod';
import { getVmErrorPhaseLabel } from '../../../../utils/getVmErrorPhaseLabel';

import MigrationStepConversionLogSection from './MigrationStepConversionLogSection';

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

  const logPod = getMigrationLogPod(pipelineStepName, pods);
  const phaseLabel = getVmErrorPhaseLabel(vmErrorPhase, t);
  const title = reasons?.[0] ?? t('Error details');
  const bodyReasons = reasons && reasons.length > 1 ? reasons.slice(1) : undefined;

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
          {logPod && <MigrationStepConversionLogSection logPod={logPod} />}
        </Stack>
      </Alert>
    </div>
  );
};

export default MigrationStepFailurePanel;
