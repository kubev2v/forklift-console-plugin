import { type ComponentProps, type ForwardedRef, forwardRef, useMemo } from 'react';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import Select from '@components/common/Select';
import {
  StorageMapModelGroupVersionKind,
  StorageMapModelRef,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  SelectList,
  SelectOption,
  Title,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type StorageMapSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
  namespace: string;
  includeOwnerReferenced?: boolean;
  testId?: string;
};

const StorageMapSelect = (
  {
    id,
    includeOwnerReferenced = false,
    namespace,
    onSelect,
    status,
    testId,
    value,
  }: StorageMapSelectProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { t } = useForkliftTranslation();
  const [allStorageMaps] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const storageMapsListUrl = getResourceUrl({
    namespace,
    reference: StorageMapModelRef,
  });

  // Filter out storage maps that have ownerReferences unless includeOwnerReferenced is true
  const storageMaps = useMemo(() => {
    if (!allStorageMaps) {
      return [];
    }
    if (includeOwnerReferenced) {
      return allStorageMaps;
    }

    return allStorageMaps.filter((storageMap) => {
      return isEmpty(storageMap.metadata?.ownerReferences);
    });
  }, [allStorageMaps, includeOwnerReferenced]);

  const emptyState = (
    <EmptyState
      titleText={
        <Title headingLevel="h4" size="md">
          {t('You do not have any storage maps without owner references.')}
        </Title>
      }
      variant={EmptyStateVariant.xs}
    >
      <EmptyStateBody>
        <ExternalLink href={`${storageMapsListUrl}/~new`} isInline>
          {t('Create a storage map without an owner')}
        </ExternalLink>
      </EmptyStateBody>
    </EmptyState>
  );

  return (
    <Select
      id={id}
      ref={ref}
      value={value}
      status={status}
      onSelect={onSelect}
      placeholder={t('Select storage map')}
      testId={testId}
    >
      <SelectList>
        {isEmpty(storageMaps)
          ? emptyState
          : storageMaps.map((storageMap) => {
              const storageMapName = getName(storageMap);

              return (
                <SelectOption key={storageMapName} value={storageMap}>
                  {storageMapName}
                </SelectOption>
              );
            })}
      </SelectList>
    </Select>
  );
};

export default forwardRef(StorageMapSelect);
