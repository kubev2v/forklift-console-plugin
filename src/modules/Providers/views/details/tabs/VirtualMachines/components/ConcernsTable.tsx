import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import type { SpecVirtualMachinePageData } from 'src/plans/details/tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { Concern, OpenstackVM, OvaVM, OVirtVM, VSphereVM } from '@kubev2v/types';
import { HelperText, HelperTextItem, Label, PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryTitle,
} from '../utils/helpers/getCategoryTitle';
import { groupConcernsByCategory } from '../utils/helpers/groupConcernsByCategory';

import type { VmData } from './VMCellProps';

type ConcernsTableProps = RowProps<VmData> | RowProps<SpecVirtualMachinePageData>;

type VirtualMachineWithConcerns = OVirtVM | VSphereVM | OpenstackVM | OvaVM;

export const ConcernsTable: FC<ConcernsTableProps> = ({ resourceData }) => {
  const { t } = useForkliftTranslation();

  const vm =
    (resourceData as VmData)?.vm ??
    (resourceData as SpecVirtualMachinePageData)?.inventoryVmData?.vm;

  const concerns: Concern[] = (vm as VirtualMachineWithConcerns)?.concerns;

  if ((!concerns || isEmpty(concerns)) && vm.providerType !== PROVIDER_TYPES.openshift) {
    return (
      <PageSection hasBodyWrapper={false}>
        <HelperText>
          <HelperTextItem>{t('No concerns found for this virtual machine.')}</HelperTextItem>
        </HelperText>
      </PageSection>
    );
  }

  const groupedConcerns = groupConcernsByCategory(concerns);

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
          {['Critical', 'Warning', 'Information'].map((category) =>
            groupedConcerns?.[category]?.map((concern) => (
              <Tr key={concern.label}>
                <Td modifier="truncate">{concern.label}</Td>
                <Td>
                  <Label
                    color={getCategoryColor(concern.category)}
                    icon={getCategoryIcon(concern.category)}
                  >
                    {getCategoryTitle(concern.category)}
                  </Label>
                </Td>
                <Td>{concern?.assessment || '-'}</Td>
              </Tr>
            )),
          )}
        </Tbody>
      </Table>
    </PageSection>
  );
};
