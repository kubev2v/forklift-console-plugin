import { ITransform } from '@patternfly/react-table';

export function accessibleRouteChangeHandler(pageId = 'primary-app-container') {
  return window.setTimeout(() => {
    const mainContainer = document.getElementById(pageId);
    if (mainContainer) {
      mainContainer.focus();
    }
  }, 50);
}

export const centerCellTransform: ITransform = () => {
  return {
    className: 'center-cell',
  };
};
