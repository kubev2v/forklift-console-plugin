import type { FC } from 'react';

import Select from '@components/common/Select';
import MultiTypeaheadSelect from '@components/common/TypeaheadSelect/MultiTypeaheadSelect/MultiTypeaheadSelect';
import type { TypeaheadSelectOption } from '@components/common/TypeaheadSelect/utils/types';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import { operatorSelectOptions } from './utils/constants';
import type { AffinityLabel } from './utils/types';

import './AffinityEditRow.scss';

type AffinityEditRowProps = {
  expression: AffinityLabel;
  onChange: (label: AffinityLabel) => void;
  onDelete: (id: number) => void;
};

const AffinityEditRow: FC<AffinityEditRowProps> = ({ expression, onChange, onDelete }) => {
  const { t } = useForkliftTranslation();

  const { id, key, operator, values = [] } = expression;
  const enableValueField =
    operator !== Operator.Exists.valueOf() && operator !== Operator.DoesNotExist.valueOf();

  const valueOptions: TypeaheadSelectOption[] = (values ?? []).map((value) => ({
    content: value,
    value,
  }));

  return (
    <>
      <GridItem span={4}>
        <TextInput
          isRequired
          onChange={(_event, newKey) => {
            onChange({ ...expression, key: newKey });
          }}
          placeholder={t('Enter key')}
          type="text"
          value={key}
        />
      </GridItem>
      <GridItem span={2}>
        <Select
          id={`affinity-operator-${id}`}
          value={operator}
          options={operatorSelectOptions}
          onSelect={(_ev, selected) => {
            const nextOp = String(selected);
            // Optional: clear values if switching to unary op to avoid stale state
            const nextValues: string[] =
              nextOp === Operator.Exists.valueOf() || nextOp === Operator.DoesNotExist.valueOf()
                ? []
                : values;
            onChange({ ...expression, operator: nextOp, values: nextValues });
          }}
        />
      </GridItem>
      <GridItem span={5}>
        <MultiTypeaheadSelect
          className="affinity-edit-row__values-chips"
          options={valueOptions}
          values={enableValueField ? values : []}
          isCreatable
          isDisabled={!enableValueField}
          placeholder={enableValueField ? t('Enter value') : ''}
          // Toggle membership on select
          onChange={(nextValues) => {
            onChange({ ...expression, values: nextValues as string[] });
          }}
          // Persist a newly created free-typed value
          onCreateOption={(created) => {
            if (!values.includes(created)) {
              onChange({ ...expression, values: [...values, created] });
            }
          }}
        />
      </GridItem>
      <GridItem span={1}>
        <Button
          onClick={() => {
            onDelete(id);
          }}
          variant={ButtonVariant.plain}
        >
          <MinusCircleIcon />
        </Button>
      </GridItem>
    </>
  );
};

export default AffinityEditRow;
