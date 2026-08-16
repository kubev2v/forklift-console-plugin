import { useNavigate } from 'react-router';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useOwnerPlanActionGate } from 'src/plans/hooks/useOwnerPlanActionGate';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, NetworkMapModelRef } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import type { NetworkMapData } from '@utils/crds/maps/types';
import { getResourceUrl } from '@utils/getResourceUrl';

type NetworkMapActionsDropdownItemsProps = {
  data: NetworkMapData;
  isDetailsPage?: boolean;
};

export const NetworkMapActionsDropdownItems = ({
  data,
  isDetailsPage,
}: NetworkMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const { obj: networkMap } = data;
  const { disabledReason, isBlocked } = useOwnerPlanActionGate(networkMap);

  const networkMapURL = getResourceUrl({
    name: networkMap?.metadata?.name,
    namespace: networkMap?.metadata?.namespace,
    reference: NetworkMapModelRef,
  });

  const onDelete = () => {
    if (!networkMap) {
      return;
    }
    launchOverlay<DeleteModalProps>(DeleteModal, { model: NetworkMapModel, resource: networkMap });
  };

  return [
    <DropdownItem
      description={disabledReason}
      isDisabled={isBlocked}
      key="edit"
      onClick={() => {
        navigate(isDetailsPage ? `${networkMapURL}/yaml` : networkMapURL)?.catch(() => undefined);
      }}
      value={0}
    >
      {isDetailsPage ? t('Edit YAML') : t('Edit')}
    </DropdownItem>,

    <DropdownItem
      description={disabledReason}
      isDisabled={isBlocked || !data?.permissions?.canDelete || !networkMap}
      key="delete"
      onClick={onDelete}
      value={1}
    >
      {t('Delete network map')}
    </DropdownItem>,
  ];
};
