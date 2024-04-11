import React from 'react';
import { TFunction } from 'react-i18next';

import {
  BlueInfoCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

/**
 * Retrieves the title for a given concern category.
 *
 * @param {string} category - The category of the concern.
 * @param {TFunction} t - The translation function.
 * @returns {string} The title for the given category.
 */
export const getCategoryTitle = (category: string, t: TFunction): string => {
  const titles = {
    Critical: t('Critical concerns'),
    Information: t('Information concerns'),
    Warning: t('Warning concerns'),
  };

  return titles[category] || '';
};

/**
 * Retrieves the icon for a given concern category.
 *
 * @param {string} category - The category of the concern.
 * @returns {ReactElement} The icon for the given category.
 */
export const getCategoryIcon = (category: string) => {
  const icons = {
    Critical: <RedExclamationCircleIcon />,
    Information: <BlueInfoCircleIcon />,
    Warning: <YellowExclamationTriangleIcon />,
  };

  return icons[category] || <></>;
};

/**
 * Retrieves the color for a given concern category.
 *
 * @param {string} category - The category of the concern.
 * @returns {string} The color for the given category.
 */
export const getCategoryColor = (category: string) => {
  const colors = {
    Critical: 'red',
    Information: 'blue',
    Warning: 'orange',
  };

  return colors[category] || 'grey';
};
