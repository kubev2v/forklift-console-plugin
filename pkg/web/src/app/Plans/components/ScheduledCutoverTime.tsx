import * as React from 'react';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import { formatTimestamp } from '@app/common/helpers';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';

interface IScheduledCutoverTimeProps {
  cutover: string | null;
}

export const ScheduledCutoverTime: React.FunctionComponent<IScheduledCutoverTimeProps> = ({
  cutover,
}: IScheduledCutoverTimeProps) => {
  if (!cutover) return null;
  const formattedCutoverTime = formatTimestamp(cutover, false);
  return (
    <div className={`${text.fontSizeSm} ${alignment.textAlignLeft}`}>
      Scheduled for cutover:
      <br />
      <time dateTime={cutover}>{formattedCutoverTime}</time>
    </div>
  );
};
