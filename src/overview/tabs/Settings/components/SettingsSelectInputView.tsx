import type { FC, ReactElement, Ref } from 'react';

import { type MenuToggleElement, Select as PfSelect } from '@patternfly/react-core';

import {
  type BlankOption,
  buildKeyToNameMap,
  type Option,
  resolveSelectedValue,
  type SettingsSelectHandler,
} from './settingsSelectInputUtils';
import SettingsSelectOptionsList from './SettingsSelectOptionsList';
import SettingsSelectToggle from './SettingsSelectToggle';

type SettingsSelectInputProps = {
  blankOption?: BlankOption;
  isOpen: boolean;
  isScrollable?: boolean;
  onChange: (value: number | string) => void;
  onSelect: SettingsSelectHandler;
  options: Option[];
  setIsOpen: (open: boolean) => void;
  showKeyAsSelected?: boolean;
  testId?: string;
  value: number | string;
};

export const SettingsSelectInputView: FC<SettingsSelectInputProps> = ({
  blankOption,
  isOpen,
  isScrollable = false,
  onSelect,
  options,
  setIsOpen,
  showKeyAsSelected = false,
  testId,
  value,
}) => {
  const keyToName = buildKeyToNameMap(options, blankOption);
  const selected = resolveSelectedValue({
    blankOption,
    keyToName,
    showKeyAsSelected,
    value,
  });

  const toggle = (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <SettingsSelectToggle
      isOpen={isOpen}
      onToggleClick={() => {
        setIsOpen(!isOpen);
      }}
      selected={selected}
      testId={testId}
      toggleRef={toggleRef}
    />
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
      <SettingsSelectOptionsList
        blankOption={blankOption}
        options={options}
        showKeyAsSelected={showKeyAsSelected}
        testId={testId}
      />
    </PfSelect>
  );
};

export type { Option } from './settingsSelectInputUtils';
