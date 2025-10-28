import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import {
  DeleteModal,
  type DeleteModalProps,
} from 'src/modules/Providers/modals/DeleteModal/DeleteModal';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModel, StorageMapModelRef } from '@kubev2v/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';

import type { StorageMapData } from '../utils/types/StorageMapData';

export const StorageMapActionsDropdownItems = ({ data }: StorageMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const { obj: StorageMap } = data;

  const StorageMapURL = getResourceUrl({
    name: StorageMap?.metadata?.name,
    namespace: StorageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  const onClick = () => {
    launcher<DeleteModalProps>(DeleteModal, { model: StorageMapModel, resource: StorageMap! });
  };

  return [
    <DropdownItemLink
      value={0}
      itemKey="EditStorageMapping"
      href={StorageMapURL}
      description={t('Edit storage map')}
    />,

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
