import React from 'react';
import { DropdownItemLink } from 'src/components/actions/DropdownItemLink';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel, ProviderModelRef } from '@kubev2v/types';
import { DropdownItem } from '@patternfly/react-core';

import { DeleteModal, useModal } from '../modals';
import { getResourceUrl, ProviderData } from '../utils';

export const ProviderActionsDropdownItems = ({ data }: ProviderActionsDropdownItemsProps) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { provider } = data;

  const providerURL = getResourceUrl({
    reference: ProviderModelRef,
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
  });

  return [
    <DropdownItemLink key="EditProvider" href={providerURL}>
      {t('Edit Provider')}
    </DropdownItemLink>,
    <DropdownItemLink key="EditCredentials" href={`${providerURL}/credentials`}>
      {t('Edit Provider Credentials')}
    </DropdownItemLink>,
    <DropdownItemLink key="MigratePlan" href={`${providerURL}/vms`}>
      {t('Migrate')}
    </DropdownItemLink>,
    <DropdownItem
      key="delete"
      isDisabled={!data?.permissions?.canDelete}
      onClick={() => showModal(<DeleteModal resource={provider} model={ProviderModel} />)}
    >
      {t('Delete Provider')}
    </DropdownItem>,
  ];
};

interface ProviderActionsDropdownItemsProps {
  data: ProviderData;
}
