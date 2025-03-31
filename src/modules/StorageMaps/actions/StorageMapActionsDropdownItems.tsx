import React from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { DeleteModal, useModal } from 'src/modules/Providers/modals';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModel, StorageMapModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

import type { StorageMapData } from '../utils';

export const StorageMapActionsDropdownItems = ({ data }: StorageMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { obj: StorageMap } = data;

  const StorageMapURL = getResourceUrl({
    name: StorageMap?.metadata?.name,
    namespace: StorageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  const onClick = () => {
    showModal(<DeleteModal resource={StorageMap} model={StorageMapModel} />);
  };

  return [
    <DropdownItemLink
      value={0}
      key="EditStorageMapping"
      href={StorageMapURL}
      description={t('Edit StorageMap')}
    />,

    <DropdownItem
      value={1}
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={onClick}
    >
      {t('Delete StorageMap')}
    </DropdownItem>,
  ];
};

type StorageMapActionsDropdownItemsProps = {
  data: StorageMapData;
};
