import {
  type ForwardedRef,
  forwardRef,
  type MutableRefObject,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  MenuToggle,
  type MenuToggleStatus,
  Select as PfSelect,
  SelectList,
  SelectOption as PfSelectOption,
  type SelectProps as PfSelectProps,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type SelectOption = {
  key?: number | string;
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type SelectProps = Pick<PfSelectProps, 'onSelect' | 'className' | 'children'> & {
  id: string;
  value: string;
  options?: SelectOption[];
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
const Select = (
  {
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
  }: SelectProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>();

  useImperativeHandle(ref, () => toggleRef.current!);

  const selectedOption = useMemo(
    () =>
      options?.find((option) => option.value === value) ??
      // Try to find a label from custom children
      (typeof value === 'string' ? { label: value } : undefined),
    [options, value],
  );

  return (
    <PfSelect
      isScrollable
      shouldFocusToggleOnSelect
      id={id}
      isOpen={isOpen}
      selected={value}
      className={className}
      toggle={(pfToggleRef: MutableRefObject<HTMLButtonElement>) => (
        <MenuToggle
          isFullWidth
          ref={(element: HTMLButtonElement) => {
            if (pfToggleRef) {
              pfToggleRef.current = element;
            }

            toggleRef.current = element;
          }}
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
      onOpenChange={(changedIsOpen) => {
        setIsOpen(changedIsOpen);
      }}
      onSelect={(event, selectedValue) => {
        onSelect?.(event, selectedValue);
        setIsOpen(false);
      }}
    >
      {children ?? (
        <SelectList>
          {(options ?? []).map((option) => (
            <PfSelectOption
              key={option.key ?? option.value}
              value={option.value}
              isDisabled={option.disabled}
              description={option.description}
            >
              {option.label}
            </PfSelectOption>
          ))}
        </SelectList>
      )}
    </PfSelect>
  );
};

export default forwardRef(Select);
