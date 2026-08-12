import { useNavigate } from 'react-router';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useOwnerPlanActionGate } from 'src/plans/hooks/useOwnerPlanActionGate';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModel, StorageMapModelRef } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';
import type { StorageMapData } from '@utils/storage/types';

type StorageMapActionsDropdownItemsProps = {
  data: StorageMapData;
  isDetailsPage?: boolean;
};

export const StorageMapActionsDropdownItems = ({
  data,
  isDetailsPage,
}: StorageMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const { obj: storageMap } = data;
  const { disabledReason, isBlocked } = useOwnerPlanActionGate(storageMap);

  const storageMapURL = getResourceUrl({
    name: storageMap?.metadata?.name,
    namespace: storageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  const onDelete = () => {
    if (!storageMap) {
      return;
    }
    launchOverlay<DeleteModalProps>(DeleteModal, { model: StorageMapModel, resource: storageMap });
  };

  return [
    <DropdownItem
      description={disabledReason}
      isDisabled={isBlocked}
      key="edit"
      onClick={() => {
        navigate(isDetailsPage ? `${storageMapURL}/yaml` : storageMapURL)?.catch(() => undefined);
      }}
      value={0}
    >
      {isDetailsPage ? t('Edit YAML') : t('Edit')}
    </DropdownItem>,

    <DropdownItem
      description={disabledReason}
      isDisabled={isBlocked || !data?.permissions?.canDelete || !storageMap}
      key="delete"
      onClick={onDelete}
      value={1}
    >
      {t('Delete storage map')}
    </DropdownItem>,
  ];
};
