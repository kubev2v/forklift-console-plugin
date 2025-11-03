import {
  chart_color_blue_100 as blue100,
  chart_color_blue_300 as blue300,
} from '@patternfly/react-tokens';

export const ChartColors = {
  Archived: '#8A8D90',
  Canceled: '#6A6E73',
  CannotStart: '#F0AB00',
  Completed: blue300.value,
  Empty: '#72767B',
  Executing: blue100.value,
  Failure: '#C9190B',
  Incomplete: '#C9190B',
  NotStarted: '#4F5255',
  Paused: '#F0AB00',
  Success: '#0066CC',
  Unknown: '#151515',
};
