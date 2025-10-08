import type { FC, ReactNode } from 'react';

import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, HelperText } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { isTermsInvalid } from './utils/isTermsInvalid';
import type { useIDEntitiesValue } from './utils/types';
import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type ExpressionEditListProps = {
  errorHelperText: ReactNode;
  expressions: useIDEntitiesValue;
  helperText: ReactNode;
  label: string;
};

const ExpressionEditList: FC<ExpressionEditListProps> = ({
  errorHelperText,
  expressions,
  helperText,
  label,
}) => {
  const { t } = useForkliftTranslation();
  const {
    entities: affinityExpressions,
    initialEntitiesChanged: affinityExpressionsChanged,
    onEntityAdd: onExpressionAdd,
    onEntityChange: onExpressionChange,
    onEntityDelete: onExpressionDelete,
  } = expressions || {};

  return (
    <>
      <FormGroup fieldId="expression-selector" label={label}>
        <HelperText>{helperText}</HelperText>
      </FormGroup>
      <AffinityEditList
        addRowText={t('Add expression')}
        expressions={affinityExpressions}
        onAdd={() => {
          onExpressionAdd({ id: 0, key: '', operator: Operator.In, values: [] });
        }}
        onChange={onExpressionChange}
        onDelete={onExpressionDelete}
        testId="add-affinity-expression-button"
      />
      {isTermsInvalid(affinityExpressions) && affinityExpressionsChanged && (
        <ErrorHelperText>{errorHelperText}</ErrorHelperText>
      )}
    </>
  );
};

export default ExpressionEditList;
