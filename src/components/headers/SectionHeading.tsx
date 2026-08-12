import type { FC, ReactNode } from 'react';

import { Title, type TitleProps } from '@patternfly/react-core';

export type SectionHeadingProps = {
  children?: ReactNode;
  className?: string;
  headingLevel?: TitleProps['headingLevel'];
  id?: string;
  testId?: string;
  text: ReactNode;
};

/**
 * SectionHeading Component
 *
 * @param {SectionHeadingProps} props - Props for the component.
 * @returns {ReactNode} - The rendered Title element.
 */
const SectionHeading: FC<SectionHeadingProps> = ({
  children,
  className,
  headingLevel = 'h2',
  id,
  testId,
  text,
}) => (
  <Title className={className} data-testid={testId} headingLevel={headingLevel} id={id}>
    {text}
    {children}
  </Title>
);

export default SectionHeading;
