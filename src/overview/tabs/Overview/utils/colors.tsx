import {
  chart_color_blue_100 as blue100,
  chart_color_blue_300 as blue300,
  chart_color_gold_400 as gold400,
  global_BackgroundColor_dark_400 as bgDark400,
  global_Color_400 as color400,
  global_icon_Color_light_dark as lightDark,
  global_palette_black_400 as black400,
  global_palette_black_500 as black500,
  global_palette_red_100 as red100,
} from '@patternfly/react-tokens';

export const ChartColors = {
  Archived: color400.value,
  Canceled: black400.value,
  CannotStart: gold400.value,
  Completed: blue300.value,
  Empty: lightDark.value,
  Executing: blue100.value,
  Failure: red100.value,
  Incomplete: red100.value,
  NotStarted: bgDark400.value,
  Paused: gold400.value,
  Success: '#0066CC',
  Unknown: black500.value,
};
