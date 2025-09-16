import { type FC, useState } from 'react';

import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, GridItem, TextInput } from '@patternfly/react-core';
import {
  Select,
  SelectOption,
  type SelectOptionObject,
  SelectVariant,
} from '@patternfly/react-core/deprecated';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

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
  const [isOperatorExpended, setIsOperatorExpended] = useState(false);
  const [isValuesExpanded, setIsValuesExpanded] = useState(false);

  const onSelectOperator = (
    _event: React.MouseEvent | React.ChangeEvent,
    value: string | SelectOptionObject,
  ) => {
    onChange({ ...expression, operator: value as string });
    setIsOperatorExpended(false);
  };

  const onSelectValues = (
    _event: React.MouseEvent | React.ChangeEvent,
    value: string | SelectOptionObject,
  ) => {
    const isValueExist = values.some((item) => item === value);
    if (isValueExist) {
      onChange({ ...expression, values: values.filter((item) => item !== value) });
    } else {
      onChange({ ...expression, values: [...values, value as string] });
    }
  };

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
          isOpen={isOperatorExpended}
          menuAppendTo="parent"
          onSelect={onSelectOperator}
          onToggle={(_, isExpanded) => {
            setIsOperatorExpended(isExpanded);
          }}
          selections={operator}
          value={operator}
        >
          {[Operator.Exists, Operator.DoesNotExist, Operator.In, Operator.NotIn].map(
            (operatorOption) => (
              <SelectOption key={operatorOption} value={operatorOption} />
            ),
          )}
        </Select>
      </GridItem>
      <GridItem span={5}>
        <Select
          className="affinity-edit-row__values-chips"
          isCreatable
          isDisabled={!enableValueField}
          isOpen={isValuesExpanded}
          menuAppendTo="parent"
          onClear={() => {
            onChange({ ...expression, values: [] });
          }}
          onSelect={onSelectValues}
          onToggle={(_, isExpanded) => {
            setIsValuesExpanded(isExpanded);
          }}
          placeholderText={enableValueField ? t('Enter value') : ''}
          selections={enableValueField ? values : []}
          typeAheadAriaLabel={t('Enter value')}
          variant={SelectVariant.typeaheadMulti}
        >
          {values?.map((option) => <SelectOption isDisabled={false} key={option} value={option} />)}
        </Select>
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
