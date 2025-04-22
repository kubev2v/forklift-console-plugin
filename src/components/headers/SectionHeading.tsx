import type { FC, ReactNode } from 'react';

type SectionHeadingProps = {
  text: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
  children?: ReactNode;
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
}) => (
  <h2 className={`co-section-heading ${className || ''}`} data-testid={dataTestid} id={id}>
    <span>{text}</span>
    {children}
  </h2>
);

export default SectionHeading;
