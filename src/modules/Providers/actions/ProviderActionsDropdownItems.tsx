import type { FC } from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel, ProviderModelRef } from '@kubev2v/types';
import { DropdownItem, DropdownList } from '@patternfly/react-core';

import { DeleteModal } from '../modals/DeleteModal/DeleteModal';
import { useModal } from '../modals/ModalHOC/ModalHOC';
import { getResourceUrl } from '../utils/helpers/getResourceUrl';
import type { ProviderData } from '../utils/types/ProviderData';

type ProviderActionsDropdownItemsProps = {
  data: ProviderData;
};

const ProviderActionsDropdownItems: FC<ProviderActionsDropdownItemsProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { provider } = data;

  if (!provider?.metadata?.name || !provider?.metadata?.namespace) return null;

  const providerURL = getResourceUrl({
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
    reference: ProviderModelRef,
  });

  const onClick = () => {
    showModal(<DeleteModal resource={provider} model={ProviderModel} />);
  };

  return (
    <DropdownList>
      <DropdownItemLink
        value={0}
        itemKey="EditProvider"
        href={providerURL}
        description={t('Edit Provider')}
      />
      {provider?.spec?.type !== 'ova' && (
        <DropdownItemLink
          value={1}
          itemKey="EditCredentials"
          href={`${providerURL}/credentials`}
          description={t('Edit Provider Credentials')}
        />
      )}
      <DropdownItemLink
        value={2}
        itemKey="MigratePlan"
        href={`${providerURL}/vms`}
        description={t('Migrate')}
      />
      <DropdownItem
        value={3}
        key="delete"
        isDisabled={!data?.permissions?.canDelete}
        onClick={onClick}
      >
        {t('Delete Provider')}
      </DropdownItem>
    </DropdownList>
  );
};

export default ProviderActionsDropdownItems;
