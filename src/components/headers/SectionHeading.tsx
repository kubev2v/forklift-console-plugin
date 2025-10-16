import type { FC, ReactNode } from 'react';

import { Content, type ContentProps } from '@patternfly/react-core';

type SectionHeadingProps = {
  text: ReactNode;
  className?: string;
  id?: string;
  testId?: string;
  children?: ReactNode;
  textComponent?: ContentProps['component'];
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
  <Content
    component={textComponent}
    className={`pf-v6-c-content--${textComponent} ${className ?? ''}`}
    data-testid={testId}
    id={id}
  >
    <span>{text}</span>
    {children}
  </Content>
);

export default SectionHeading;
