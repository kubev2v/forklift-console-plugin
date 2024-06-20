import React from 'react';
import { TFunction } from 'react-i18next';

import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';

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
    Critical: <ExclamationCircleIcon color="#C9190B" />,
    Information: <InfoCircleIcon color="#2B9AF3" />,
    Warning: <ExclamationTriangleIcon color="#F0AB00" />,
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
