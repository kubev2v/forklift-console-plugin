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
      canCreate={false}
      isScrollable
      noResultFoundLabel={errorMessage}
      onSelect={(selected) => {
        onChange(selected.toString());
      }}
      placeholder={t('No namespace selected')}
      selectOptions={dropdownItems}
      value={value}
    />
  );
};

export default TargetNamespaceSelect;
