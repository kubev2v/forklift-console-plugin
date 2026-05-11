import { useNavigate } from 'react-router-dom-v5-compat';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, NetworkMapModelRef } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';

import type { NetworkMapData } from '../utils/types';

type NetworkMapActionsDropdownItemsProps = {
  data: NetworkMapData;
  isKebab?: boolean;
};

export const NetworkMapActionsDropdownItems = ({
  data,
  isKebab,
}: NetworkMapActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const navigate = useNavigate();

  const { obj: networkMap } = data;

  const networkMapURL = getResourceUrl({
    name: networkMap?.metadata?.name,
    namespace: networkMap?.metadata?.namespace,
    reference: NetworkMapModelRef,
  });

  const onDelete = () => {
    if (!networkMap) return;
    launcher<DeleteModalProps>(DeleteModal, { model: NetworkMapModel, resource: networkMap });
  };

  return [
    <DropdownItem
      value={0}
      key="edit"
      onClick={() => {
        navigate(isKebab ? networkMapURL : `${networkMapURL}/yaml`);
      }}
    >
      {isKebab ? t('Edit') : t('Edit YAML')}
    </DropdownItem>,

    <DropdownItem
      value={1}
      key="delete"
      isDisabled={!data?.permissions?.canDelete || !networkMap}
      onClick={onDelete}
    >
      {t('Delete network map')}
    </DropdownItem>,
  ];
};
