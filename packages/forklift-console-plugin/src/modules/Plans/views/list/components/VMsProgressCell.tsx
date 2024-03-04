import React from 'react';
import { Link } from 'react-router-dom';
import {
  getMigrationVmsCounts,
  getPhaseLabel,
  getPlanPhase,
  getPlanProgressVariant,
} from 'src/modules/Plans/utils';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import {
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';

import { CellProps } from './CellProps';

export const VMsProgressCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const specVms = data?.obj?.spec?.vms;
  const vms = data?.obj?.status?.migration?.vms;

  const phase = getPlanPhase(data);
  const phaseLabel = t(getPhaseLabel(phase));

  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: data?.obj?.metadata?.name,
    namespace: data?.obj?.metadata?.namespace,
  });

  if (!vms) {
    return (
      <Link to={`${planURL}`}>
        <Split>
          <SplitItem className="forklift-overview__controller-card__status-icon">
            <VirtualMachineIcon />
          </SplitItem>
          <SplitItem>{t('{{total}} VMs', { total: specVms?.length || 0 })}</SplitItem>
        </Split>
      </Link>
    );
  }

  const counters = getMigrationVmsCounts(vms);
  const progressVariant = getPlanProgressVariant(phase);

  return (
    <Link to={`${planURL}`}>
      <div className="forklift-table__status-cell-progress">
        <Progress
          width={100}
          label={t('{{success}} of {{total}} VMs migrated', counters)}
          valueText={t('{{success}} of {{total}} VMs migrated', counters)}
          value={counters?.total > 0 ? (100 * counters?.success) / counters?.total : 0}
          title={t(phaseLabel)}
          size={ProgressSize.sm}
          measureLocation={ProgressMeasureLocation.top}
          variant={progressVariant}
        />
      </div>
    </Link>
  );
};
