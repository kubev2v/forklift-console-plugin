import { type FC, Fragment } from 'react';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

import { ConcernsTableEmptyState } from '@components/Concerns/components/ConcernsTableEmptyState';
import ConcernsTableHeader from '@components/Concerns/components/ConcernsTableHeader';
import {
  groupConcernsByCategory,
  groupConditionsByCategory,
} from '@components/Concerns/utils/category';
import type { Concern, OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';
import { PageSection } from '@patternfly/react-core';
import { Table, Tbody } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import { orderedConcernCategories } from '../constants';

import ConcernsTableRows from './ConcernsTableRows';
import ConditionsTableRows from './ConditionsTableRows';
import type { VmData } from './VMCellProps';

type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

const ConcernsAndConditionsTable: FC<{ vmData: VmData | SpecVirtualMachinePageData }> = ({
  vmData,
}) => {
  const vm = (vmData as VmData)?.vm ?? (vmData as SpecVirtualMachinePageData)?.inventoryVmData?.vm;

  const concerns: Concern[] = (vm as VirtualMachineWithConcerns)?.concerns;
  const conditions = (vmData as SpecVirtualMachinePageData)?.conditions;

  if (isEmpty(concerns) && isEmpty(conditions)) {
    return <ConcernsTableEmptyState />;
  }

  const groupedConcerns = groupConcernsByCategory(concerns);
  const groupedConditions = groupConditionsByCategory(conditions);

  return (
    <PageSection hasBodyWrapper={false}>
      <Table aria-label="Expandable table" variant="compact">
        <ConcernsTableHeader />
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
