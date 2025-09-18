import type { FC } from 'react';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  HelperText,
  HelperTextItem,
  Label,
  PageSection,
  PageSectionVariants,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryTitle,
  groupConcernsByCategory,
} from '../utils/category';
import { orderedConcernCategories, type VirtualMachineWithConcerns } from '../utils/constants';

import './ConcernsTable.scss';

export const ConcernsTable: FC<{ vmData: VmData }> = ({ vmData }) => {
  const { t } = useForkliftTranslation();

  const vm = vmData?.vm as VirtualMachineWithConcerns;

  const concerns = vm?.concerns;

  if (isEmpty(concerns)) {
    return (
      <PageSection variant={PageSectionVariants.light}>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('No concerns found for this virtual machine.')}
          </HelperTextItem>
        </HelperText>
      </PageSection>
    );
  }

  const groupedConcerns = groupConcernsByCategory(concerns);

  return (
    <PageSection variant={PageSectionVariants.light} className="concerns-table">
      <Table aria-label="Expandable table" variant="compact">
        <Thead>
          <Tr>
            <Th width={10}>{t('Label')}</Th>
            <Th width={10}>{t('Category')}</Th>
            <Th width={30}>{t('Assessment')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orderedConcernCategories.map((category) =>
            groupedConcerns?.[category].map((concern) => (
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
                <Td>{concern?.assessment || EMPTY_MSG}</Td>
              </Tr>
            )),
          )}
        </Tbody>
      </Table>
    </PageSection>
  );
};
