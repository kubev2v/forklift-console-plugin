import { getCategoryIcon, getCategoryTitle } from '@components/Concerns/utils/category';
import { orderedConcernCategories } from '@components/Concerns/utils/constants';
import type { CheckboxOption } from '@components/VsphereFoldersTable/components/AttributeFilter/utils/types';
import { t } from '@utils/i18n';

export const orderedConcernCategoriesFilterOptions: CheckboxOption[] = orderedConcernCategories.map(
  (cat) => ({
    icon: getCategoryIcon(cat),
    id: cat,
    label: getCategoryTitle(cat),
  }),
);

export const powerFilterOptions = [
  { id: 'on', label: t('On') },
  { id: 'off', label: t('Off') },
  { id: 'unknown', label: t('Unknown') },
];

export const NO_FOLDER = 'no-folder';

export const FOLDER_PREFIX = 'folder-';
