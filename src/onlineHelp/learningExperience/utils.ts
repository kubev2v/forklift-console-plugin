import { TextListVariants } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { ListStyleType } from './types';

export const getClassForListStyle = (listStyleType?: ListStyleType): string | undefined =>
  isEmpty(listStyleType) ? undefined : `forklift--learning__list-type--${listStyleType}`;

export const getTextListComponentForListStyle = (
  listStyleType?: ListStyleType,
): 'ul' | 'ol' | undefined =>
  listStyleType === 'decimal' || listStyleType === 'lower-alpha'
    ? TextListVariants.ol
    : TextListVariants.ul;
