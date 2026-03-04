import { type ComponentProps, type ForwardedRef, forwardRef, useMemo } from 'react';

import Select from '@components/common/Select';
import type { IoK8sApiCoreV1ConfigMap } from '@forklift-ui/types';
import { type K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SelectList, SelectOption } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { CONFIG_MAP_GVK } from './constants';
import { isScriptConfigMap } from './utils';

type ConfigMapSelectProps = Pick<ComponentProps<typeof Select>, 'status'> & {
  id: string;
  namespace: string;
  onSelect: (event: unknown, configMap: IoK8sApiCoreV1ConfigMap) => void;
  testId?: string;
  value: string;
};

const ConfigMapSelect = (
  { id, namespace, onSelect, status, testId, value }: ConfigMapSelectProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { t } = useForkliftTranslation();

  const [allConfigMaps] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: CONFIG_MAP_GVK,
    isList: true,
    namespace,
  });

  const scriptConfigMaps = useMemo((): IoK8sApiCoreV1ConfigMap[] => {
    if (!allConfigMaps) {
      return [];
    }

    return allConfigMaps.filter((cm) =>
      isScriptConfigMap((cm as IoK8sApiCoreV1ConfigMap).data),
    ) as IoK8sApiCoreV1ConfigMap[];
  }, [allConfigMaps]);

  const hasNoScriptConfigMaps = isEmpty(scriptConfigMaps);

  const handleSelect = (_event: unknown, selectedName: string | number): void => {
    const match = scriptConfigMaps.find((cm) => getName(cm) === selectedName);

    if (match) {
      onSelect(_event, match);
    }
  };

  return (
    <Select
      id={id}
      ref={ref}
      value={value}
      status={status}
      onSelect={handleSelect}
      isDisabled={hasNoScriptConfigMaps}
      placeholder={
        hasNoScriptConfigMaps
          ? t('No ConfigMaps with customization scripts found in this project.')
          : t('Select a ConfigMap')
      }
      testId={testId}
    >
      <SelectList>
        {scriptConfigMaps.map((configMap) => {
          const configMapName = getName(configMap) ?? '';

          return (
            <SelectOption key={configMapName} value={configMapName}>
              {configMapName}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

export default forwardRef(ConfigMapSelect);
