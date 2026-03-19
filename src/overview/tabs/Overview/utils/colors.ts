import {
  chart_color_black_300 as black300,
  chart_color_black_400 as black400,
  chart_color_black_500 as black500,
  chart_color_blue_100 as blue100,
  chart_color_blue_300 as blue300,
  chart_color_orange_200 as orange200,
  chart_color_red_orange_300 as redOrange300,
} from '@patternfly/react-tokens';

export const ChartColors = {
  Archived: black400.value,
  Canceled: black500.value,
  CannotStart: orange200.value,
  Completed: blue300.value,
  Empty: black300.value,
  Executing: blue100.value,
  Failure: redOrange300.value,
  Incomplete: redOrange300.value,
  NotStarted: black500.value,
  Paused: orange200.value,
  Success: blue300.value,
  Unknown: '#151515',
};
