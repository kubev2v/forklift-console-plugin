import { ContentVariants } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { ListStyleType } from './types';

export const getClassForListStyle = (listStyleType?: ListStyleType): string | undefined =>
  isEmpty(listStyleType) ? undefined : `forklift--learning__list-type--${listStyleType}`;

export const getTextListComponentForListStyle = (
  listStyleType?: ListStyleType,
): 'ul' | 'ol' | undefined =>
  listStyleType === ListStyleType.DECIMAL || listStyleType === ListStyleType.LOWER_ALPHA
    ? ContentVariants.ol
    : ContentVariants.ul;
