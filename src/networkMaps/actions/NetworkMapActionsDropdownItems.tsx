import { useNavigate } from 'react-router-dom-v5-compat';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, NetworkMapModelRef } from '@kubev2v/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';

import type { NetworkMapData } from '../utils/types';

type NetworkMapActionsDropdownItemsProps = {
  data: NetworkMapData;
};

export const NetworkMapActionsDropdownItems = ({ data }: NetworkMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const navigate = useNavigate();

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
    <DropdownItem
      value={0}
      key="edit"
      onClick={() => {
        navigate(networkMapURL);
      }}
    >
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
