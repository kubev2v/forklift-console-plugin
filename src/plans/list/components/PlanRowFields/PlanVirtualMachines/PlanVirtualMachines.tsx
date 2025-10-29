import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Flex, Split, SplitItem } from '@patternfly/react-core';
import { VirtualMachineIcon } from '@patternfly/react-icons';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';

import type { PlanFieldProps } from '../utils/types';

const PlanVirtualMachines: FC<PlanFieldProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const planVMs = getPlanVirtualMachines(plan);

  const planURL = getPlanURL(plan);

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      <Link to={`${planURL}/vms`}>
        <Split>
          <SplitItem className="pf-v6-u-pr-sm">
            <VirtualMachineIcon />
          </SplitItem>
          <SplitItem>
            {t('{{total}} VM', {
              count: planVMs?.length,
              total: planVMs?.length,
            })}
          </SplitItem>
        </Split>
      </Link>
    </Flex>
  );
};

export default PlanVirtualMachines;
