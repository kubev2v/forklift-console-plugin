import {
  chart_color_blue_100 as blue100,
  chart_color_blue_300 as blue300,
  chart_color_blue_400 as blue400,
  chart_color_green_300 as green300,
  chart_color_orange_300 as orange300,
  chart_color_purple_300 as purple300,
  chart_color_red_orange_300 as redOrange300,
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

export const ThroughputLineColors: string[] = [
  blue400.value,
  green300.value,
  orange300.value,
  purple300.value,
  redOrange300.value,
];
