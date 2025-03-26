import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import {
  getMigrationVmsCounts,
  getPlanPhase,
  getPlanProgressVariant,
  MigrationVmsCounts,
} from 'src/modules/Plans/utils';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import {
  Button,
  Popover,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { HelpIcon, VirtualMachineIcon } from '@patternfly/react-icons';

import { CellProps } from './CellProps';

type PlanStatusDetailsProps = {
  counters: MigrationVmsCounts;
};

const PlanStatusDetails: React.FC<PlanStatusDetailsProps> = (props) => {
  const { t } = useForkliftTranslation();

  return (
    <div>
      {t('Total of {{total}} VMs are planned for migration:', props.counters)}
      <br />
      {t('{{success}} VMs succeeded', props.counters)}
      <br />
      {t('{{error}} VMs failed', props.counters)}
      <br />
      {t('{{canceled}} VMs canceled', props.counters)}
      <br />
    </div>
  );
};

export const VMsProgressCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const specVms = data?.obj?.spec?.vms;
  const vms = data?.obj?.status?.migration?.vms;

  const phase = getPlanPhase(data);
  const phaseLabel: string = phase;

  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: data?.obj?.metadata?.name,
    namespace: data?.obj?.metadata?.namespace,
  });

  if (!vms) {
    return (
      <Link to={`${planURL}/vms`}>
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
    <div className="forklift-table__status-cell-progress">
      <Progress
        width={100}
        label={
          <Link to={`${planURL}/vms`}>{t('{{success}} of {{total}} VMs migrated', counters)}</Link>
        }
        valueText={t('{{success}} of {{total}} VMs migrated', counters)}
        value={counters?.total > 0 ? (100 * counters?.success) / counters?.total : 0}
        title={
          <Popover
            headerContent={<div>{t('Status details')}</div>}
            bodyContent={<PlanStatusDetails counters={counters} />}
          >
            <Button variant="link" isInline>
              {t(phaseLabel)} <HelpIcon />
            </Button>
          </Popover>
        }
        size={ProgressSize.sm}
        measureLocation={ProgressMeasureLocation.top}
        variant={progressVariant}
      />
    </div>
  );
};
