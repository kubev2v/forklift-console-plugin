import type { FC } from 'react';
import { getMigrationVmsCounts } from 'src/modules/Plans/utils/helpers/getMigrationVmsCounts';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Plan } from '@kubev2v/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';

import PlanStatusVmCount from './PlanStatusVmCount';

type PlanVirtualMachineStatusesProps = {
  plan: V1beta1Plan;
};
const PlanVirtualMachineStatuses: FC<PlanVirtualMachineStatusesProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const planURL = getPlanURL(plan);

  // All VM count links point to the same place for now,
  // but will be updated to target only affected VMs in the future.
  // Could possibly use a querystring to dictate a table filter for the list of VMs.
  const vmCountLinkPath = `${planURL}/vms`;
  const vms = getPlanVirtualMachinesMigrationStatus(plan);

  const vmCount = getMigrationVmsCounts(vms);

  return (
    <Split hasGutter>
      {vmCount.success > 0 && (
        <SplitItem>
          <PlanStatusVmCount
            count={vmCount.success}
            status="success"
            linkPath={vmCountLinkPath}
            tooltipLabel={t('Succeeded')}
          />
        </SplitItem>
      )}

      {vmCount.canceled > 0 && (
        <SplitItem>
          <PlanStatusVmCount
            count={vmCount.canceled}
            status="canceled"
            linkPath={vmCountLinkPath}
            tooltipLabel={t('Canceled')}
          />
        </SplitItem>
      )}

      {vmCount.error > 0 && (
        <SplitItem>
          <PlanStatusVmCount
            count={vmCount.error}
            status="danger"
            linkPath={vmCountLinkPath}
            tooltipLabel={t('Failed')}
          />
        </SplitItem>
      )}
    </Split>
  );
};

export default PlanVirtualMachineStatuses;
