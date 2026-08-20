import {
  type ForwardedRef,
  forwardRef,
  type MutableRefObject,
  type ReactElement,
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
  description?: string;
  disabled?: boolean;
  key?: number | string;
  label: string;
  value: string;
};

type SelectProps = Pick<PfSelectProps, 'onSelect' | 'className' | 'children'> & {
  id: string;
  isDisabled?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  status?: MenuToggleStatus;
  testId?: string;
  value: string | undefined;
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
): ReactElement => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>();

  useImperativeHandle(ref, () => toggleRef.current as HTMLButtonElement);

  const selectedOption = useMemo(
    () =>
      options?.find((option) => option.value === value) ??
      // Try to find a label from custom children
      (typeof value === 'string' ? { label: value } : undefined),
    [options, value],
  );

  return (
    <PfSelect
      className={className}
      id={id}
      isOpen={isOpen}
      isScrollable
      onOpenChange={(changedIsOpen) => {
        setIsOpen(changedIsOpen);
      }}
      onSelect={(event, selectedValue) => {
        onSelect?.(event, selectedValue);
        setIsOpen(false);
      }}
      selected={value}
      shouldFocusToggleOnSelect
      toggle={(pfToggleRef: MutableRefObject<HTMLButtonElement>) => (
        <MenuToggle
          aria-label="Select menu toggle"
          data-testid={testId}
          isDisabled={isDisabled}
          isExpanded={isOpen}
          isFullWidth
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          ref={(element: HTMLButtonElement) => {
            if (pfToggleRef) {
              pfToggleRef.current = element;
            }

            toggleRef.current = element;
          }}
          status={status}
        >
          {selectedOption?.label?.trim()
            ? selectedOption.label
            : (placeholder ?? t('Select an option'))}
        </MenuToggle>
      )}
    >
      {children ?? (
        <SelectList>
          {(options ?? []).map((option) => (
            <PfSelectOption
              description={option.description}
              isDisabled={option.disabled}
              key={option.key ?? option.value}
              value={option.value}
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
