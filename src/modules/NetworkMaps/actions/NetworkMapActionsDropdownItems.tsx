import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import {
  DeleteModal,
  type DeleteModalProps,
} from 'src/modules/Providers/modals/DeleteModal/DeleteModal';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, NetworkMapModelRef } from '@kubev2v/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';

import type { NetworkMapData } from '../utils/types/NetworkMapData';

export const NetworkMapActionsDropdownItems = ({ data }: NetworkMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const { obj: networkMap } = data;

  const networkMapURL = getResourceUrl({
    name: networkMap?.metadata?.name,
    namespace: networkMap?.metadata?.namespace,
    reference: NetworkMapModelRef,
  });

  const onClick = () => {
    launcher<DeleteModalProps>(DeleteModal, { model: NetworkMapModel, resource: networkMap! });
  };

  return [
    <DropdownItemLink value={0} itemKey="EditNetworkMapping" href={networkMapURL}>
      {t('Edit network map')}
    </DropdownItemLink>,

    <DropdownItem
      value={1}
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={onClick}
    >
      {t('Delete network map')}
    </DropdownItem>,
  ];
};

type NetworkMapActionsDropdownItemsProps = {
  data: NetworkMapData;
};
