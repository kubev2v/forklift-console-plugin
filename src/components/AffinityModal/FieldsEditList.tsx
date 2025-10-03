import type { FC, ReactNode } from 'react';

import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, HelperText } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { isTermsInvalid } from './utils/isTermsInvalid';
import type { useIDEntitiesValue } from './utils/types';
import AffinityEditList from './AffinityEditList';
import ErrorHelperText from './ErrorHelperText';

type FieldsEditListProps = {
  errorHelperText: ReactNode;
  fields: useIDEntitiesValue;
  helperText: ReactNode;
  label: string;
};

const FieldsEditList: FC<FieldsEditListProps> = ({
  errorHelperText,
  fields,
  helperText,
  label,
}) => {
  const { t } = useForkliftTranslation();
  const {
    entities: affinityFields,
    initialEntitiesChanged: affinityFieldsChanged,
    onEntityAdd: onFieldAdd,
    onEntityChange: onFieldChange,
    onEntityDelete: onFieldDelete,
  } = fields || {};

  return (
    <>
      <FormGroup fieldId="field-selector" label={label}>
        <HelperText>{helperText}</HelperText>
      </FormGroup>
      <AffinityEditList
        addRowText={t('Add field')}
        expressions={affinityFields}
        onAdd={() => {
          onFieldAdd({ id: null, key: '', operator: Operator.In.valueOf(), values: [] });
        }}
        onChange={onFieldChange}
        onDelete={onFieldDelete}
        testId="add-affinity-field-button"
      />
      {isTermsInvalid(affinityFields) && affinityFieldsChanged && (
        <ErrorHelperText>{errorHelperText}</ErrorHelperText>
      )}
    </>
  );
};

export default FieldsEditList;
