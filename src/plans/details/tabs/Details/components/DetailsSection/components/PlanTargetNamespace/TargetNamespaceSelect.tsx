import type { FC } from 'react';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import { useForkliftTranslation } from '@utils/i18n';

import type { TargetNamespaceSelectProps } from './utils/types';

const TargetNamespaceSelect: FC<TargetNamespaceSelectProps> = ({
  errorMessage,
  onChange,
  projectNames,
  value,
}) => {
  const { t } = useForkliftTranslation();

  const dropdownItems = projectNames.map((name) => ({
    children: <>{name}</>,
    itemId: name,
  }));

  return (
    <FilterableSelect
      selectOptions={dropdownItems}
      value={value}
      onSelect={(selected) => {
        onChange(selected.toString());
      }}
      canCreate={false}
      isScrollable
      placeholder={t('No namespace selected')}
      noResultFoundLabel={errorMessage}
    />
  );
};

export default TargetNamespaceSelect;
