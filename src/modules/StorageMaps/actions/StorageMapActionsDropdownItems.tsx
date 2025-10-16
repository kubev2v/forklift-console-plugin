import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { DeleteModal } from 'src/modules/Providers/modals/DeleteModal/DeleteModal';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModel, StorageMapModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

import type { StorageMapData } from '../utils/types/StorageMapData';

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
    showModal(<DeleteModal resource={StorageMap!} model={StorageMapModel} />);
  };

  return [
    <DropdownItemLink value={0} itemKey="EditStorageMapping" href={StorageMapURL}>
      {t('Edit storage map')}
    </DropdownItemLink>,

    <DropdownItem
      value={1}
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={onClick}
    >
      {t('Delete storage map')}
    </DropdownItem>,
  ];
};

type StorageMapActionsDropdownItemsProps = {
  data: StorageMapData;
};
