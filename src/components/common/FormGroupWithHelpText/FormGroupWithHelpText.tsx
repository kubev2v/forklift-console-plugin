import type { FC, ReactNode } from 'react';

import {
  FormGroup,
  type FormGroupProps,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

type FormGroupWithHelpTextProps = {
  /**
   * Sets the FormGroup validated. If you set to success, text color of helper text will be modified to indicate valid state.
   * If set to error, text color of helper text will be modified to indicate error state.
   * If set to warning, text color of helper text will be modified to indicate warning state.
   */
  validated?: 'success' | 'warning' | 'error' | 'default';
  /**
   * Helper text regarding the field. It can be a simple text or an object.
   */
  helperText?: ReactNode;
  /**
   * Helper text after the field when the field is invalid. It can be a simple text or an object.
   */
  helperTextInvalid?: ReactNode;
} & FormGroupProps;

/**
 * Convert the formGroup validated mode into the variant styling of the helper text item
 * If validated mode was not set or if it's the 'default', use 'default' variant which shows
 * plain text without icons for informational helper text
 */
const validatedToVariant = (validated: 'success' | 'warning' | 'error' | 'default' | undefined) =>
  !validated || validated === 'default' ? 'default' : validated;

/**
 *  A FormGroup component that supports helperTexts
 *
 *  This component wraps the FormGroup with an option to use the following helper text related properties
 *  (since not supported anymore as part of the FormGroup component in PatternFly 5):
 *  helperText, helperTextInvalid, validated
 *
 * `See` https://www.patternfly.org/get-started/release-highlights/#helper-text
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/FormGroupWithHelpText/FormGroupWithHelpText.tsx)
 */
export const FormGroupWithHelpText: FC<FormGroupWithHelpTextProps> = ({
  children,
  fieldId,
  helperText,
  helperTextInvalid,
  isRequired,
  label,
  labelHelp,
  role,
  validated,
}) => {
  const helperTextMsg = validated === 'error' && helperTextInvalid ? helperTextInvalid : helperText;
  const variant = validatedToVariant(validated);

  return (
    <FormGroup
      label={label}
      isRequired={isRequired}
      fieldId={fieldId}
      labelHelp={labelHelp}
      role={role}
    >
      {children}
      <FormHelperText hidden={false}>
        <HelperText>
          <HelperTextItem
            variant={variant}
            data-testid={validated === 'error' ? 'form-helper-text-error' : 'form-helper-text'}
          >
            {helperTextMsg}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
