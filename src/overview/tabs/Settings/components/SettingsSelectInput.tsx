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
  description?: string;
  key: number | string;
  name: string;
};

/**
 * @typedef BlankOption
 * @property {string} name - The display name for the blank option
 * @property {string} [description] - Optional description for the blank option
 */
type BlankOption = {
  description?: string;
  name: string;
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
  blankOption?: BlankOption;
  isScrollable?: boolean;
  onChange: (value: number | string) => void;
  options: Option[];
  showKeyAsSelected?: boolean; // a flag to show selected value that's based on option key and not name
  testId?: string;
  value: number | string;
};

const BLANK_OPTION_KEY = '__blank__';

/**
 * SelectInput component. Provides a select input form element with predefined options.
 */
const SettingsSelectInput: FC<SettingsSelectInputProps> = ({
  blankOption,
  isScrollable = false,
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

  const selected = useMemo(() => {
    if (showKeyAsSelected) {
      return blankOption && value === '' ? blankOption.name : value;
    }

    return keyToName?.[value] ?? value;
  }, [blankOption, keyToName, showKeyAsSelected, value]);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      className="forklift-overview__settings-select"
      data-testid={testId}
      isExpanded={isOpen}
      onClick={onToggleClick}
      ref={toggleRef}
    >
      <Truncate content={String(selected) || t('Select an option')} />
    </MenuToggle>
  );

  const renderOptions = () => {
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
      return [
        <SelectOption
          data-testid={testId ? `${testId}-option-none` : undefined}
          description={blankOption.description}
          key={BLANK_OPTION_KEY}
          value={blankOption.name}
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

      const key = nameToKey[selectedValue] ?? selectedValue;
      onChange(key === BLANK_OPTION_KEY ? '' : key);
      setIsOpen(false);
    },
    [nameToKey, onChange],
  );

  return (
    <PfSelect
      aria-label="Select Input with descriptions"
      aria-labelledby="exampleSelect"
      isOpen={isOpen}
      isScrollable={isScrollable}
      onOpenChange={(nextOpen: boolean) => {
        setIsOpen(nextOpen);
      }}
      onSelect={onSelect}
      popperProps={{
        direction: 'down',
        enableFlip: true,
      }}
      role="menu"
      selected={selected}
      shouldFocusFirstItemOnOpen={false}
      shouldFocusToggleOnSelect
      toggle={toggle}
    >
      <SelectList>{renderOptions()}</SelectList>
    </PfSelect>
  );
};

export default SettingsSelectInput;
