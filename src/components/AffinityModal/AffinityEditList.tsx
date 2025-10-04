import type { FC } from 'react';

import LabelsList from '@components/NodeSelectorModal/LabelList';
import { GridItem, Text, TextVariants } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { AffinityLabel } from './utils/types';
import AffinityEditRow from './AffinityEditRow';

type AffinityEditListProps = {
  addRowText: string;
  expressions: AffinityLabel[];
  onAdd: () => void;
  onChange: (aff: AffinityLabel) => void;
  onDelete: (id: number) => void;
  testId?: string;
};

const AffinityEditList: FC<AffinityEditListProps> = ({
  addRowText,
  expressions,
  onAdd,
  onChange,
  onDelete,
  testId,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <LabelsList
      addRowText={addRowText}
      emptyStateAddRowText={addRowText}
      isEmpty={isEmpty(expressions)}
      onLabelAdd={onAdd}
      testId={testId}
    >
      {!isEmpty(expressions) && (
        <>
          <GridItem span={4}>
            <Text component={TextVariants.h6}>{t('Key')}</Text>
          </GridItem>
          <GridItem span={2}>
            <Text component={TextVariants.h6}>{t('Operator')}</Text>
          </GridItem>
          <GridItem span={6}>
            <Text component={TextVariants.h6}>{t('Values')}</Text>
          </GridItem>
          {expressions.map((expression) => (
            <AffinityEditRow
              expression={expression}
              key={expression.id}
              onChange={onChange}
              onDelete={onDelete}
            />
          ))}
        </>
      )}
    </LabelsList>
  );
};

export default AffinityEditList;
