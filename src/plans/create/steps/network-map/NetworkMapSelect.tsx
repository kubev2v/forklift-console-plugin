import type { ComponentProps, FC } from 'react';

import Select from '@components/common/MtvSelect';
import { NetworkMapModelGroupVersionKind, type V1beta1NetworkMap } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type NetworkMapSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
};

const NetworkMapSelect: FC<NetworkMapSelectProps> = ({ id, onSelect, status, value }) => {
  const { t } = useForkliftTranslation();
  const [networkMaps] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
  });

  return (
    <Select
      id={id}
      value={value}
      status={status}
      onSelect={onSelect}
      placeholder={t('Select network map')}
    >
      {networkMaps.map((networkMap) => (
        <SelectOption key={networkMap.metadata?.name} value={networkMap}>
          {networkMap.metadata?.name}
        </SelectOption>
      ))}
    </Select>
  );
};

export default NetworkMapSelect;
