import { type Dispatch, type FC, type SetStateAction, useMemo } from 'react';

import { HelperText, HelperTextItem, PageSection, Title } from '@patternfly/react-core';
import { Table, TableVariant, Th, Thead, Tr } from '@patternfly/react-table';
import { getCreatedAt, getLabels, getName, getUID } from '@utils/crds/common/selectors';
import { CONVERSION_LABELS } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import InspectionTableRow from './InspectionTableRow';

import './InspectionExpandedSection.scss';

type InspectionExpandedSectionProps = {
  conversions: V1beta1Conversion[];
  expandedRows: Set<string>;
  onToggleExpand: Dispatch<SetStateAction<Set<string>>>;
  vmId: string;
};

const COLUMN_COUNT = 5;

const InspectionExpandedSection: FC<InspectionExpandedSectionProps> = ({
  conversions,
  expandedRows,
  onToggleExpand,
  vmId,
}) => {
  const { t } = useForkliftTranslation();

  const vmConversions = useMemo(
    () =>
      conversions
        .filter((conversion) => getLabels(conversion)?.[CONVERSION_LABELS.VM_ID] === vmId)
        .sort(
          (first, second) =>
            new Date(getCreatedAt(second) ?? 0).getTime() -
            new Date(getCreatedAt(first) ?? 0).getTime(),
        ),
    [conversions, vmId],
  );

  const toggleExpand = (uid: string): void => {
    onToggleExpand((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  if (isEmpty(vmConversions)) {
    return (
      <div data-testid="inspections-section">
        <Title headingLevel="h4">{t('Inspections')}</Title>
        <PageSection hasBodyWrapper={false}>
          <HelperText>
            <HelperTextItem>{t('No inspections found for this virtual machine.')}</HelperTextItem>
          </HelperText>
        </PageSection>
      </div>
    );
  }

  return (
    <div data-testid="inspections-section">
      <Title headingLevel="h4">{t('Inspections')}</Title>
      <PageSection hasBodyWrapper={false}>
        <Table
          aria-label={t('Inspections')}
          variant={TableVariant.compact}
          className="forklift-inspections-table"
        >
          <Thead>
            <Tr>
              <Th screenReaderText={t('Expand')} />
              <Th>{t('Inspection name')}</Th>
              <Th>{t('Status')}</Th>
              <Th>{t('Pod')}</Th>
              <Th>{t('Created at')}</Th>
            </Tr>
          </Thead>
          {vmConversions.map((conversion, rowIndex) => {
            const uid = getUID(conversion) ?? getName(conversion) ?? '';
            return (
              <InspectionTableRow
                key={uid}
                columnCount={COLUMN_COUNT}
                conversion={conversion}
                isExpanded={expandedRows.has(uid)}
                onToggle={() => {
                  toggleExpand(uid);
                }}
                rowIndex={rowIndex}
              />
            );
          })}
        </Table>
      </PageSection>
    </div>
  );
};

export default InspectionExpandedSection;
