import type { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { type ProviderInventory, ProviderModelRef } from '@kubev2v/types';
import { Alert } from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

type InfoSectionProps = {
  name: string | undefined;
  namespace: string | undefined;
  inventory: ProviderInventory | null;
};

const InfoSection: FC<InfoSectionProps> = ({ inventory, name, namespace }) => {
  const { t } = useForkliftTranslation();

  const providerURL = getResourceUrl({
    name,
    namespace,
    reference: ProviderModelRef,
  });

  return (
    <ModalHOC>
      {(inventory?.vmCount ?? 0) > 0 && (
        <Alert customIcon={<BellIcon />} variant="info" title={t('How to create a migration plan')}>
          <ForkliftTrans>
            To migrate virtual machines from <strong>{name}</strong> provider, select the virtual
            machines to migrate from the list of available virtual machines located in the virtual
            machines tab.{' '}
            <Link to={`${providerURL}/vms`}>
              Go to <strong>Virtual Machines</strong> tab
            </Link>
          </ForkliftTrans>
        </Alert>
      )}
    </ModalHOC>
  );
};

export default InfoSection;
