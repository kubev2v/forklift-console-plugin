import * as React from 'react';
import dayjs from 'dayjs';
import { formatDuration } from '../helpers';

interface ITickingElapsedTimeProps {
  start?: string;
  end?: string;
}

export const TickingElapsedTime: React.FunctionComponent<ITickingElapsedTimeProps> = ({
  start,
  end,
}: ITickingElapsedTimeProps) => {
  const [endTime, setEndTime] = React.useState(end ? dayjs(end) : dayjs());

  const intervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const stopTicking = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    if (!end) {
      intervalRef.current = window.setInterval(() => {
        if (!end) setEndTime(dayjs());
      }, 1000);
    } else {
      setEndTime(dayjs(end));
      stopTicking();
    }
    return stopTicking;
  }, [end]);

  if (!start) return null;

  return <>{formatDuration(start, endTime)}</>;
};
