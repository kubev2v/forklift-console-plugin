import { useNavigate } from 'react-router-dom-v5-compat';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import type { StorageMapData } from 'src/storageMaps/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModel, StorageMapModelRef } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';

type StorageMapActionsDropdownItemsProps = {
  data: StorageMapData;
  isKebab?: boolean;
};

export const StorageMapActionsDropdownItems = ({
  data,
  isKebab,
}: StorageMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const navigate = useNavigate();

  const { obj: storageMap } = data;

  const storageMapURL = getResourceUrl({
    name: storageMap?.metadata?.name,
    namespace: storageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  const onDelete = () => {
    if (!storageMap) return;
    launcher<DeleteModalProps>(DeleteModal, { model: StorageMapModel, resource: storageMap });
  };

  return [
    <DropdownItem
      value={0}
      key="edit"
      onClick={() => {
        navigate(isKebab ? storageMapURL : `${storageMapURL}/yaml`);
      }}
    >
      {isKebab ? t('Edit') : t('Edit YAML')}
    </DropdownItem>,

    <DropdownItem
      value={1}
      key="delete"
      isDisabled={!data?.permissions?.canDelete || !storageMap}
      onClick={onDelete}
    >
      {t('Delete storage map')}
    </DropdownItem>,
  ];
};
