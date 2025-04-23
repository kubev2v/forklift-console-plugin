import type { FC } from 'react';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';

import { FilterableSelect } from '@components/FilterableSelect/FilterableSelect';
import type { OpenShiftNamespace, V1beta1Provider } from '@kubev2v/types';
import { useForkliftTranslation } from '@utils/i18n';

type TargetNamespaceSelectProps = {
  provider: V1beta1Provider;
  value: string;
  onChange: (val: string) => void;
};

const TargetNamespaceSelect: FC<TargetNamespaceSelectProps> = ({ onChange, provider, value }) => {
  const { t } = useForkliftTranslation();

  const { inventory: namespaces } = useProviderInventory<OpenShiftNamespace[]>({
    provider,
    subPath: 'namespaces?detail=4',
  });

  const options = (namespaces ?? []).map((ns) => ns?.object?.metadata?.name);

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
      canCreate
      placeholder={t('No namespace selected')}
    />
  );
};

export default TargetNamespaceSelect;
