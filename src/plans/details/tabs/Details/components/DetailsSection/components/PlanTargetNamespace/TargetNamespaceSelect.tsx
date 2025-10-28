import type { FC } from 'react';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import type { V1beta1Provider } from '@kubev2v/types';
import useWatchProjectNames from '@utils/hooks/useWatchProjectNames';
import { useForkliftTranslation } from '@utils/i18n';

type TargetNamespaceSelectProps = {
  provider: V1beta1Provider;
  value: string;
  onChange: (val: string) => void;
};

const TargetNamespaceSelect: FC<TargetNamespaceSelectProps> = ({ onChange, value }) => {
  const { t } = useForkliftTranslation();

  const [options] = useWatchProjectNames();

  const dropdownItems = options.map((name) => ({
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
    />
  );
};

export default TargetNamespaceSelect;
