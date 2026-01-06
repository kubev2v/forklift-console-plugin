import { useNavigate } from 'react-router-dom-v5-compat';
import {
  DeleteModal,
  type DeleteModalProps,
} from 'src/modules/Providers/modals/DeleteModal/DeleteModal';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import type { StorageMapData } from 'src/storageMaps/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModel, StorageMapModelRef } from '@kubev2v/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';

type StorageMapActionsDropdownItemsProps = {
  data: StorageMapData;
};

export const StorageMapActionsDropdownItems = ({ data }: StorageMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const navigate = useNavigate();

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
    <DropdownItem
      value={0}
      key="EditStorageMapping"
      onClick={() => {
        navigate(StorageMapURL);
      }}
    >
      {t('Edit storage map')}
    </DropdownItem>,

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
