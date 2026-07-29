import { useNavigate } from 'react-router';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useOwnerPlanActionGate } from 'src/plans/hooks/useOwnerPlanActionGate';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, NetworkMapModelRef } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
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
  const launcher = useModal();
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
    launcher<DeleteModalProps>(DeleteModal, { model: NetworkMapModel, resource: networkMap });
  };

  return [
    <DropdownItem
      value={0}
      key="edit"
      isDisabled={isBlocked}
      description={disabledReason}
      onClick={() => {
        navigate(isDetailsPage ? `${networkMapURL}/yaml` : networkMapURL)?.catch(() => undefined);
      }}
    >
      {isDetailsPage ? t('Edit YAML') : t('Edit')}
    </DropdownItem>,

    <DropdownItem
      value={1}
      key="delete"
      isDisabled={isBlocked || !data?.permissions?.canDelete || !networkMap}
      description={disabledReason}
      onClick={onDelete}
    >
      {t('Delete network map')}
    </DropdownItem>,
  ];
};
