import {
  DeleteModal,
  type DeleteModalProps,
} from 'src/modules/Providers/modals/DeleteModal/DeleteModal';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, NetworkMapModelRef } from '@kubev2v/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';

import type { NetworkMapData } from '../utils/types';

type NetworkMapActionsDropdownItemsProps = {
  data: NetworkMapData;
};

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
    <DropdownItem value={0} key="edit" to={networkMapURL}>
      {t('Edit network map')}
    </DropdownItem>,

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
