import type { FC } from 'react';

import { ConsoleTimestamp } from '@components/ConsoleTimestamp/ConsoleTimestamp';
import HelpText from '@components/HelpText';
import StatusIcon from '@components/status/StatusIcon';
import type { V1beta1PlanStatusConditions } from '@kubev2v/types';
import { Icon, Split, SplitItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CATEGORY_TYPES, EMPTY_MSG } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { getStatusLabel } from './utils/utils';

type ConditionsSectionProps = {
  conditions?: V1beta1PlanStatusConditions[];
};

const ConditionsSection: FC<ConditionsSectionProps> = ({ conditions }) => {
  const { t } = useForkliftTranslation();

  if (isEmpty(conditions)) {
    return <HelpText>{t('Conditions not found')}</HelpText>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th width={10}>{t('Type')}</Th>
          <Th width={10}>{t('Status')}</Th>
          <Th width={20}>{t('Updated')}</Th>
          <Th width={10}>{t('Reason')}</Th>
          <Th> {t('Message')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions?.map(({ category, lastTransitionTime, message, reason, status, type }) => (
          <Tr key={type}>
            <Td>
              <Split>
                {category === CATEGORY_TYPES.CRITICAL && (
                  <SplitItem className="pf-v6-u-pr-sm">
                    <Icon size="md">
                      <StatusIcon phase={category} />
                    </Icon>
                  </SplitItem>
                )}
                <SplitItem>{type}</SplitItem>
              </Split>
            </Td>
            <Td>{getStatusLabel(status)}</Td>
            <Td>
              <ConsoleTimestamp timestamp={lastTransitionTime} />
            </Td>
            <Td>{reason}</Td>
            <Td modifier="truncate">{message ?? EMPTY_MSG}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ConditionsSection;
