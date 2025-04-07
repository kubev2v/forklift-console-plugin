import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';

import { HelperText, HelperTextItem } from '@patternfly/react-core';

/**
 * `EditProviderSectionHeading` is a functional component that renders a section heading with a divider above it.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.text - The text to display as the section heading.
 * @param {string} props.helpText - The text to display as the section description help text.
 *
 * @returns {ReactElement} The rendered JSX element.
 */
export const EditProviderSectionHeading: FC<EditProviderSectionHeadingProps> = ({
  helpText,
  text,
}) => (
  <>
    <SectionHeading text={text} className="forklift-create-provider-edit-section-header" />

    {helpText && (
      <HelperText className="forklift-create-subtitle">
        <HelperTextItem variant="default">{helpText}</HelperTextItem>
      </HelperText>
    )}
  </>
);

type EditProviderSectionHeadingProps = {
  text: string;
  helpText?: string;
};
