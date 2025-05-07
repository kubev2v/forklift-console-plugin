import type { FC, ReactNode } from 'react';

import { Text, type TextProps } from '@patternfly/react-core';

type SectionHeadingProps = {
  text: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
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
  'data-testid': dataTestid,
  id,
  text,
  textComponent = 'h2',
}) => (
  <Text
    component={textComponent}
    className={`co-section-heading ${className ?? ''}`}
    data-testid={dataTestid}
    id={id}
  >
    <span>{text}</span>
    {children}
  </Text>
);

export default SectionHeading;
