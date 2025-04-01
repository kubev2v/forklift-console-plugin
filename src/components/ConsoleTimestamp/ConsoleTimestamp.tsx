import * as React from 'react';

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
  timestamp: string | number | Date;
  className?: string;
};

/**
 * Patternfly timestamp use:
 *   standard format
 *   no icon
 * Console show timestamp using:
 *   glob icon
 *   custom format
 */
export const ConsoleTimestamp = (props: TimestampProps) => {
  // Check for null. If props.timestamp is null, it returns incorrect date and time of Wed Dec 31 1969 19:00:00 GMT-0500 (Eastern Standard Time)
  if (!props.timestamp) {
    return <div className="co-timestamp">-</div>;
  }

  const currentDate = new Date(props.timestamp);

  return (
    <div className={props.className}>
      <GlobeAmericasIcon className="co-icon-and-text__icon" />
      <Timestamp
        className="forklift-table__console-timestamp"
        date={currentDate}
        customFormat={{
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }}
        tooltip={{ variant: TimestampTooltipVariant.default }}
      />
    </div>
  );
};
