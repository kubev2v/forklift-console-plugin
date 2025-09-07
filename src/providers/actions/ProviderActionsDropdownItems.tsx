import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { DeleteModal } from 'src/modules/Providers/modals/DeleteModal/DeleteModal';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import { PROVIDER_TYPES } from '../utils/constants';
import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';

type ProviderActionsDropdownItemsProps = {
  data: ProviderData;
};

const ProviderActionsDropdownItems: FC<ProviderActionsDropdownItemsProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const navigate = useNavigate();

  const { provider } = data;

  if (!provider || !getName(provider) || !getNamespace(provider)) return null;

  const providerURL = getProviderDetailsPageUrl(provider);

  const onProviderDelete = () => {
    showModal(<DeleteModal resource={provider} model={ProviderModel} />);
  };

  return (
    <DropdownList>
      <DropdownItem
        value={0}
        key="EditProvider"
        onClick={() => {
          navigate(providerURL);
        }}
      >
        {t('Edit provider')}
      </DropdownItem>
      {provider?.spec?.type !== PROVIDER_TYPES.ova && (
        <DropdownItem
          value={1}
          key="EditCredentials"
          href={`${providerURL}/credentials`}
          onClick={() => {
            navigate(`${providerURL}/credentials`);
          }}
        >
          {t('Edit provider credentials')}
        </DropdownItem>
      )}
      <DropdownItem
        value={2}
        key="delete"
        isDisabled={!data?.permissions?.canDelete}
        onClick={onProviderDelete}
      >
        {t('Delete provider')}
      </DropdownItem>
    </DropdownList>
  );
};

export default ProviderActionsDropdownItems;
