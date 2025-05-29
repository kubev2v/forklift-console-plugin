import type { ComponentProps, FC } from 'react';

import Select from '@components/common/MtvSelect';
import { StorageMapModelGroupVersionKind, type V1beta1StorageMap } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type StorageMapSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
};

const StorageMapSelect: FC<StorageMapSelectProps> = ({ id, onSelect, status, value }) => {
  const { t } = useForkliftTranslation();
  const [storageMaps] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
  });

  return (
    <Select
      id={id}
      value={value}
      status={status}
      onSelect={onSelect}
      placeholder={t('Select storage map')}
    >
      {storageMaps.map((storageMap) => (
        <SelectOption key={storageMap.metadata?.name} value={storageMap}>
          {storageMap.metadata?.name}
        </SelectOption>
      ))}
    </Select>
  );
};

export default StorageMapSelect;
