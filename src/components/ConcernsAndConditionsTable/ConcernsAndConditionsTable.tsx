import { type FC, Fragment } from 'react';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';
import type { ProviderVmData } from 'src/utils/types';

import {
  groupConcernsByCategory,
  groupConditionsByCategory,
} from '@components/Concerns/utils/category';
import { orderedConcernCategories } from '@components/Concerns/utils/constants';
import type { Concern, OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';
import { Table, Tbody } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import ConcernsAndConditionsTableEmptyState from './components/ConcernsAndConditionsTableEmptyState';
import ConcernsAndConditionsTableHeader from './components/ConcernsAndConditionsTableHeader';
import ConcernsTableRows from './components/ConcernsTableRows';
import ConditionsTableRows from './components/ConditionsTableRows';

type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

const ConcernsAndConditionsTable: FC<{ vmData: ProviderVmData | SpecVirtualMachinePageData }> = ({
  vmData,
}) => {
  const vm =
    (vmData as ProviderVmData)?.vm ?? (vmData as SpecVirtualMachinePageData)?.inventoryVmData?.vm;

  const concerns: Concern[] = (vm as VirtualMachineWithConcerns)?.concerns;
  const conditions = (vmData as SpecVirtualMachinePageData)?.conditions;

  if (isEmpty(concerns) && isEmpty(conditions)) {
    return <ConcernsAndConditionsTableEmptyState />;
  }

  const groupedConcerns = groupConcernsByCategory(concerns);
  const groupedConditions = groupConditionsByCategory(conditions);

  return (
    <PageSection hasBodyWrapper={false}>
      <Table aria-label="Expandable table" variant="compact">
        <ConcernsAndConditionsTableHeader />
        <Tbody>
          {orderedConcernCategories.map((category) => {
            return (
              <Fragment key={`${category}-key`}>
                <ConcernsTableRows
                  category={category}
                  groupedConcerns={groupedConcerns}
                  key={`${category}-key`}
                />
                <ConditionsTableRows
                  category={category}
                  groupedConditions={groupedConditions}
                  key={`${category}-key`}
                />
              </Fragment>
            );
          })}
        </Tbody>
      </Table>
    </PageSection>
  );
};

export default ConcernsAndConditionsTable;
