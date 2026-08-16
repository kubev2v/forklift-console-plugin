import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { DeleteModal, type DeleteModalProps } from 'src/components/modals/DeleteModal/DeleteModal';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import { getProviderDetailsPageUrl } from '../utils/getProviderDetailsPageUrl';

type ProviderActionsDropdownItemsProps = {
  data: ProviderData;
  isDetailsPage?: boolean;
};

const ProviderActionsDropdownItems: FC<ProviderActionsDropdownItemsProps> = ({
  data,
  isDetailsPage,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const { provider } = data;

  if (!provider || !getName(provider) || !getNamespace(provider)) {
    return null;
  }

  const providerURL = getProviderDetailsPageUrl(provider);

  const onProviderDelete = () => {
    launchOverlay<DeleteModalProps>(DeleteModal, { model: ProviderModel, resource: provider });
  };

  return (
    <DropdownList>
      <DropdownItem
        key="EditProvider"
        onClick={() => {
          navigate(isDetailsPage ? `${providerURL}/yaml` : providerURL)?.catch(() => undefined);
        }}
        value={0}
      >
        {isDetailsPage ? t('Edit YAML') : t('Edit')}
      </DropdownItem>
      {provider?.spec?.type !== PROVIDER_TYPES.ova && (
        <DropdownItem
          href={`${providerURL}/credentials`}
          key="EditCredentials"
          onClick={() => {
            navigate(`${providerURL}/credentials`)?.catch(() => undefined);
          }}
          value={1}
        >
          {t('Edit provider credentials')}
        </DropdownItem>
      )}
      <DropdownItem
        isDisabled={!data?.permissions?.canDelete}
        key="delete"
        onClick={onProviderDelete}
        value={2}
      >
        {t('Delete provider')}
      </DropdownItem>
    </DropdownList>
  );
};

export default ProviderActionsDropdownItems;
