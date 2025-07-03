import { type FC, useMemo, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleStatus,
  Select,
  SelectList,
  SelectOption,
  type SelectProps,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type MtvSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type MtvSelectProps = Pick<SelectProps, 'onSelect' | 'className' | 'children'> & {
  id: string;
  value: string;
  options?: MtvSelectOption[];
  status?: MenuToggleStatus;
  placeholder?: string;
  isDisabled?: boolean;
  testId?: string;
};

/**
 * A customized PatternFly Select that enforces project conventions.
 *
 * Use this instead of `@patternfly/react-core/Select`.
 */
const MtvSelect: FC<MtvSelectProps> = ({
  children,
  className,
  id,
  isDisabled,
  onSelect,
  options,
  placeholder = '',
  status,
  testId,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(
    () =>
      options?.find((option) => option.value === value) ??
      // Try to find a label from custom children
      (typeof value === 'string' ? { label: value } : undefined),
    [options, value],
  );

  return (
    <Select
      isScrollable
      shouldFocusToggleOnSelect
      id={id}
      isOpen={isOpen}
      selected={value}
      className={className}
      toggle={(ref) => (
        <MenuToggle
          isFullWidth
          ref={ref}
          data-testid={testId}
          isDisabled={isDisabled}
          isExpanded={isOpen}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-label="Select menu toggle"
          status={status}
        >
          {selectedOption?.label?.trim()
            ? selectedOption.label
            : (placeholder ?? t('Select an option'))}
        </MenuToggle>
      )}
      onOpenChange={setIsOpen}
      onSelect={(event, selectedValue) => {
        onSelect?.(event, selectedValue);
        setIsOpen(false);
      }}
    >
      {children ?? (
        <SelectList>
          {(options ?? []).map((option) => (
            <SelectOption key={option.value} value={option.value} isDisabled={option.disabled}>
              {option.label}
            </SelectOption>
          ))}
        </SelectList>
      )}
    </Select>
  );
};

export default MtvSelect;
