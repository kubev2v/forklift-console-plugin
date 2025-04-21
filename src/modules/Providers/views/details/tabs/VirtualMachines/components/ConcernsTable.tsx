import type { FC } from 'react';
import type { RowProps } from 'src/components/common/TableView/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelperText, HelperTextItem, Label, PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryTitle,
} from '../utils/helpers/getCategoryTitle';
import { groupConcernsByCategory } from '../utils/helpers/groupConcernsByCategory';

import type { VmData } from './VMCellProps';

/**
 * React Component to display a table of concerns.
 */
export const ConcernsTable: FC<RowProps<VmData>> = ({ resourceData }) => {
  const { t } = useForkliftTranslation();

  if (!resourceData?.vm?.concerns || resourceData?.vm?.concerns?.length < 1) {
    return (
      <PageSection>
        <HelperText>
          <HelperTextItem variant="indeterminate">
            {t('No concerns found for this virtual machine.')}
          </HelperTextItem>
        </HelperText>
      </PageSection>
    );
  }

  const groupedConcerns = groupConcernsByCategory(resourceData?.vm?.concerns);

  return (
    <PageSection>
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
