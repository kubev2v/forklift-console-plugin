import { type ComponentProps, type ForwardedRef, forwardRef, useMemo } from 'react';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import Select from '@components/common/Select';
import {
  StorageMapModelGroupVersionKind,
  StorageMapModelRef,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  SelectList,
  SelectOption,
  Title,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';
import { isEmpty } from '@utils/helpers';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

type StorageMapSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  includeOwnerReferenced?: boolean;
  namespace: string;
  testId?: string;
  value: string;
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
  const [allStorageMaps] = useTypedK8sWatchResource<V1beta1StorageMap[]>({
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
      onSelect={onSelect}
      placeholder={t('Select storage map')}
      ref={ref}
      status={status}
      testId={testId}
      value={value}
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
