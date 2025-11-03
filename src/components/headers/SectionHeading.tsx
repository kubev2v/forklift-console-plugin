import type { FC, ReactNode } from 'react';

import { Title, type TitleProps } from '@patternfly/react-core';

type SectionHeadingProps = {
  text: ReactNode;
  className?: string;
  id?: string;
  testId?: string;
  children?: ReactNode;
  headingLevel?: TitleProps['headingLevel'];
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
  <Title headingLevel={headingLevel} className={className} data-testid={testId} id={id}>
    {text}
    {children}
  </Title>
);

export default SectionHeading;
