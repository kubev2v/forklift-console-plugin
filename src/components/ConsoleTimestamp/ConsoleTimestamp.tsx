import type { FC } from 'react';

import { Timestamp, TimestampTooltipVariant } from '@patternfly/react-core';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

/**
 * Patternfly timestamp use:
 *   gray color
 *   dashed underline
 * Console show timestamp using:
 *   black color
 *   no underline decoration
 */
import './ConsoleTimestamp.style.css';

type TimestampProps = {
  timestamp: string | number | Date | null | undefined;
  className?: string;
  showGlobalIcon?: boolean;
};

/**
 * Patternfly timestamp use:
 *   standard format
 *   no icon
 * Console show timestamp using:
 *   glob icon
 *   custom format
 */
export const ConsoleTimestamp: FC<TimestampProps> = ({
  className,
  showGlobalIcon = true,
  timestamp,
}) => {
  // Check for null. If props.timestamp is null, it returns incorrect date and time of Wed Dec 31 1969 19:00:00 GMT-0500 (Eastern Standard Time)
  if (!timestamp) {
    return <div className="co-timestamp">-</div>;
  }

  const currentDate = new Date(timestamp);

  return (
    <div className={className}>
      {showGlobalIcon && <GlobeAmericasIcon className="co-icon-and-text__icon" />}
      <Timestamp
        className="forklift-table__console-timestamp"
        date={currentDate}
        customFormat={{
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          month: 'short',
          year: 'numeric',
        }}
        tooltip={{ variant: TimestampTooltipVariant.default }}
      />
    </div>
  );
};
