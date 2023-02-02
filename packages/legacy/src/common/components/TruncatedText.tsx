import { Tooltip, TooltipProps } from '@patternfly/react-core';
import * as React from 'react';
import './TruncatedText.css';

interface ITruncatedTextProps {
  children: React.ReactNode;
  className?: string;
  tooltipProps?: Partial<TooltipProps>;
}

// TODO: lib-ui candidate
export const TruncatedText: React.FunctionComponent<ITruncatedTextProps> = ({
  children,
  className = '',
  tooltipProps = {},
}: ITruncatedTextProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const onMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.offsetWidth < target.scrollWidth) {
      !isTooltipVisible && setIsTooltipVisible(true);
    } else {
      isTooltipVisible && setIsTooltipVisible(false);
    }
  };

  const truncatedChildren = (
    <div className={`truncated-text ${className}`} onMouseEnter={onMouseEnter}>
      {children}
    </div>
  );

  return isTooltipVisible ? (
    <Tooltip content={children} isVisible {...tooltipProps}>
      {truncatedChildren}
    </Tooltip>
  ) : (
    truncatedChildren
  );
};
