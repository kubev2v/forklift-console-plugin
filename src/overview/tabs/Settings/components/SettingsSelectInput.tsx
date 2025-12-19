import { type FC, type MouseEvent, type Ref, useCallback, useMemo, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect,
  SelectList,
  SelectOption,
  Truncate,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

/**
 * @typedef Option
 * @property {number} key
 * @property {number | string} name
 * @property {string} description
 */
export type Option = {
  key: number | string;
  name: string;
  description?: string;
};

/**
 * @typedef BlankOption
 * @property {string} name - The display name for the blank option
 * @property {string} [description] - Optional description for the blank option
 */
type BlankOption = {
  name: string;
  description?: string;
};

/**
 * @typedef SettingsSelectInputProps
 * @property {string} value - The current selected value
 * @property {(value: string) => void} onChange - Function to call when the value changes
 * @property {Option[]} options - The options to present to the user
 * @property {BlankOption} [blankOption] - Optional blank option that passes an empty value when selected
 * @property {string} [testId] - Test ID for the select component
 */
type SettingsSelectInputProps = {
  value: number | string;
  onChange: (value: number | string) => void;
  options: Option[];
  blankOption?: BlankOption;
  showKeyAsSelected?: boolean; // a flag to show selected value that's based on option key and not name
  testId?: string;
};

const BLANK_OPTION_KEY = '__blank__';

/**
 * SelectInput component. Provides a select input form element with predefined options.
 */
const SettingsSelectInput: FC<SettingsSelectInputProps> = ({
  blankOption,
  onChange,
  options,
  showKeyAsSelected = false,
  testId,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const nameToKey = useMemo(() => {
    const dict = options?.reduce<Record<string, string | number>>((acc, option) => {
      acc[option.name] = option.key;
      return acc;
    }, {});

    if (blankOption) {
      dict[blankOption.name] = BLANK_OPTION_KEY;
    }

    return dict;
  }, [options, blankOption]);

  const keyToName = useMemo(() => {
    const dict = options?.reduce<Record<string, string | number>>((acc, option) => {
      acc[option.key] = option.name;
      return acc;
    }, {});

    if (blankOption) {
      dict[BLANK_OPTION_KEY] = blankOption.name;
    }

    return dict;
  }, [options, blankOption]);

  const [selected, setSelected] = useState<string | number>(keyToName?.[value] ?? value);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      className="forklift-overview__settings-select"
      data-testid={testId}
    >
      <Truncate content={String(selected) || t('Select an option')} />
    </MenuToggle>
  );

  const renderOptions = () => {
    const optionElements = options?.map(({ description, key, name }) => (
      <SelectOption
        key={key}
        value={showKeyAsSelected ? key : name}
        description={description}
        data-testid={testId ? `${testId}-option-${key}` : undefined}
      >
        {name}
      </SelectOption>
    ));

    if (blankOption) {
      return [
        <SelectOption
          key={BLANK_OPTION_KEY}
          value={blankOption.name}
          description={blankOption.description}
          data-testid={testId ? `${testId}-option-none` : undefined}
        >
          {blankOption.name}
        </SelectOption>,
        ...optionElements,
      ];
    }

    return optionElements;
  };

  const onSelect = useCallback(
    (_event?: MouseEvent, selectedValue?: string | number) => {
      if (selectedValue === undefined) {
        setIsOpen(false);
        return;
      }
      // Use the dictionary to find the key corresponding to the selected name
      const key = nameToKey[selectedValue] || selectedValue;

      onChange(key === BLANK_OPTION_KEY ? '' : key);

      setSelected(showKeyAsSelected && key !== BLANK_OPTION_KEY ? key : (selectedValue as string));
      setIsOpen(false);
    },
    [nameToKey, onChange, showKeyAsSelected],
  );

  return (
    <PfSelect
      role="menu"
      aria-label="Select Input with descriptions"
      aria-labelledby="exampleSelect"
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(nextOpen: boolean) => {
        setIsOpen(nextOpen);
      }}
      toggle={toggle}
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        direction: 'down',
        enableFlip: true,
      }}
    >
      <SelectList>{renderOptions()}</SelectList>
    </PfSelect>
  );
};

export default SettingsSelectInput;
