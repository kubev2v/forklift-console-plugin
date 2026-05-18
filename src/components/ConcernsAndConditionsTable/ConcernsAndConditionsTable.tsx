import { type FC, Fragment } from 'react';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';
import type { ProviderVmData } from 'src/utils/types';

import {
  groupConcernsByCategory,
  groupConditionsByCategory,
} from '@components/Concerns/utils/category';
import { orderedConcernCategories } from '@components/Concerns/utils/constants';
import type { Concern, OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@forklift-ui/types';
import { PageSection, Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import ConcernsAndConditionsTableEmptyState from './components/ConcernsAndConditionsTableEmptyState';
import ConcernsAndConditionsTableHeader from './components/ConcernsAndConditionsTableHeader';
import ConcernsTableRows from './components/ConcernsTableRows';
import ConditionsTableRows from './components/ConditionsTableRows';

type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

const ConcernsAndConditionsTable: FC<{ vmData: ProviderVmData | SpecVirtualMachinePageData }> = ({
  vmData,
}) => {
  const { t } = useForkliftTranslation();
  const vm =
    (vmData as ProviderVmData)?.vm ?? (vmData as SpecVirtualMachinePageData)?.inventoryVmData?.vm;

  const concerns: Concern[] = (vm as VirtualMachineWithConcerns)?.concerns;
  const conditions = (vmData as SpecVirtualMachinePageData)?.conditions;

  const hasData = !isEmpty(concerns) || !isEmpty(conditions);
  const groupedConcerns = groupConcernsByCategory(concerns);
  const groupedConditions = groupConditionsByCategory(conditions);

  return (
    <>
      <Title className="pf-v6-u-mt-md" headingLevel="h4">
        {t('Concerns')}
      </Title>
      {hasData ? (
        <PageSection hasBodyWrapper={false}>
          <Table aria-label="Expandable table" variant={TableVariant.compact}>
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
      ) : (
        <ConcernsAndConditionsTableEmptyState />
      )}
    </>
  );
};

export default ConcernsAndConditionsTable;
