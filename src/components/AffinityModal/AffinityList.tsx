import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';

import type { AffinityRowData } from './utils/types';
import AddAffinityRuleButton from './AddAffinityRuleButton';
import AffinityDescriptionText from './AffinityDescriptionText';
import AffinityRow from './AffinityRow';

type AffinityListProps = {
  affinities: AffinityRowData[];
  onAffinityClickAdd: () => void;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityList: FC<AffinityListProps> = ({
  affinities,
  onAffinityClickAdd,
  onDelete,
  onEdit,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <AffinityDescriptionText />
      </StackItem>
      <StackItem data-testid="affinity-rules-list">
        <Table aria-label={t('Affinity rules')} variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Type')}</Th>
              <Th>{t('Condition')}</Th>
              <Th>{t('Weight')}</Th>
              <Th>{t('Terms')}</Th>
              <Th className="pf-v6-c-table__action" />
            </Tr>
          </Thead>
          <Tbody>
            {(affinities ?? []).map((affinity) => (
              <AffinityRow
                affinity={affinity}
                key={affinity.id}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </Tbody>
        </Table>
      </StackItem>
      <StackItem>
        <AddAffinityRuleButton isLinkButton onAffinityClickAdd={onAffinityClickAdd} />
      </StackItem>
    </Stack>
  );
};

export default AffinityList;
