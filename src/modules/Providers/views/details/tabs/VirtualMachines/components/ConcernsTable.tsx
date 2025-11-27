import { type FC, Fragment } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { Concern, OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';
import { HelperText, HelperTextItem, PageSection } from '@patternfly/react-core';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import { orderedConcernCategories } from '../constants';
import { groupConcernsByCategory } from '../utils/helpers/groupConcernsByCategory';
import { groupConditionsByCategory } from '../utils/helpers/groupConditionsByCategory';

import ConcernsTableRows from './ConcernsTableRows';
import ConditionsTableRows from './ConditionsTableRows';
import type { VmData } from './VMCellProps';

type ConcernsTableProps = RowProps<VmData> | RowProps<SpecVirtualMachinePageData>;

type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

export const ConcernsTable: FC<ConcernsTableProps> = ({ resourceData }) => {
  const { t } = useForkliftTranslation();

  const vm =
    (resourceData as VmData)?.vm ??
    (resourceData as SpecVirtualMachinePageData)?.inventoryVmData?.vm;

  const concerns: Concern[] = (vm as VirtualMachineWithConcerns)?.concerns;
  const conditions = (resourceData as SpecVirtualMachinePageData)?.conditions;

  if (
    (!concerns || isEmpty(concerns)) &&
    (!conditions || isEmpty(conditions)) &&
    vm?.providerType !== PROVIDER_TYPES.openshift
  ) {
    return (
      <PageSection hasBodyWrapper={false}>
        <HelperText>
          <HelperTextItem>{t('No concerns found for this virtual machine.')}</HelperTextItem>
        </HelperText>
      </PageSection>
    );
  }

  const groupedConcerns = groupConcernsByCategory(concerns);
  const groupedConditions = groupConditionsByCategory(conditions);

  return (
    <PageSection hasBodyWrapper={false}>
      <Table aria-label="Expandable table" variant="compact">
        <Thead>
          <Tr>
            <Th width={10}>{t('Label')}</Th>
            <Th width={10}>{t('Category')}</Th>
            <Th width={30}>{t('Assessment')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orderedConcernCategories.map((category, index) => {
            return (
              <Fragment key={index}>
                <ConcernsTableRows
                  category={category}
                  groupedConcerns={groupedConcerns}
                  key={index}
                />
                <ConditionsTableRows
                  category={category}
                  groupedConditions={groupedConditions}
                  key={index}
                />
              </Fragment>
            );
          })}
        </Tbody>
      </Table>
    </PageSection>
  );
};
