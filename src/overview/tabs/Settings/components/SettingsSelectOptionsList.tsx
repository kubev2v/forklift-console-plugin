import type { FC } from 'react';

import { SelectList, SelectOption } from '@patternfly/react-core';

import { BLANK_OPTION_KEY, type BlankOption, type Option } from './settingsSelectInputUtils';

type SettingsSelectOptionsListProps = {
  blankOption?: BlankOption;
  options: Option[];
  showKeyAsSelected: boolean;
  testId?: string;
};

const SettingsSelectOptionsList: FC<SettingsSelectOptionsListProps> = ({
  blankOption,
  options,
  showKeyAsSelected,
  testId,
}) => {
  const optionElements = options?.map(({ description, key, name }) => (
    <SelectOption
      data-testid={testId ? `${testId}-option-${key}` : undefined}
      description={description}
      key={key}
      value={showKeyAsSelected ? key : name}
    >
      {name}
    </SelectOption>
  ));

  if (blankOption) {
    return (
      <SelectList>
        <SelectOption
          data-testid={testId ? `${testId}-option-none` : undefined}
          description={blankOption.description}
          key={BLANK_OPTION_KEY}
          value={blankOption.name}
        >
          {blankOption.name}
        </SelectOption>
        {optionElements}
      </SelectList>
    );
  }

  return <SelectList>{optionElements}</SelectList>;
};

export default SettingsSelectOptionsList;
