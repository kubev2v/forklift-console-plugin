import React, { FC, ReactNode } from 'react';

interface SectionHeadingProps {
  text: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

/**
 * SectionHeading Component
 *
 * @param {SectionHeadingProps} props - Props for the component.
 * @returns {ReactNode} - The rendered h2 element.
 */
export const SectionHeading: FC<SectionHeadingProps> = ({
  children,
  text,
  className,
  id,
  'data-testid': dataTestid,
}) => (
  <h2 className={`co-section-heading ${className || ''}`} data-testid={dataTestid} id={id}>
    <span>{text}</span>
    {children}
  </h2>
);

export default SectionHeading;
