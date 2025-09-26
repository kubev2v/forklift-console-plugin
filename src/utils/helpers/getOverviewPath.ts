import { OVERVIEW_BASE_PATH, type OverviewTabHref } from '../../overview/constants';

export const getOverviewPath = (tab?: OverviewTabHref): string => {
  if (tab) {
    return `${OVERVIEW_BASE_PATH}/${tab}`;
  }

  return OVERVIEW_BASE_PATH;
};
