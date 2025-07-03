import type { FC, ReactNode } from 'react';

import { Text, type TextProps } from '@patternfly/react-core';

type SectionHeadingProps = {
  text: ReactNode;
  className?: string;
  id?: string;
  testId?: string;
  children?: ReactNode;
  textComponent?: TextProps['component'];
};

/**
 * SectionHeading Component
 *
 * @param {SectionHeadingProps} props - Props for the component.
 * @returns {ReactNode} - The rendered h2 element.
 */
const SectionHeading: FC<SectionHeadingProps> = ({
  children,
  className,
  id,
  testId,
  text,
  textComponent = 'h2',
}) => (
  <Text
    component={textComponent}
    className={`pf-v6-c-content--${textComponent} ${className ?? ''}`}
    data-testid={testId}
    id={id}
  >
    <span>{text}</span>
    {children}
  </Text>
);

export default SectionHeading;
