import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import {
  CreatedAtDetailsItem,
  CredentialsDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
  SecretDetailsItem,
  TransferNetworkDetailsItem,
  TypeDetailsItem,
  URLDetailsItem,
} from './components';
import { DetailsSectionProps } from './DetailsSection';

export const OpenshiftDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { provider, permissions } = data;

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />

      <DetailsItem title={''} content={''} />

      <NameDetailsItem resource={provider} />

      <NamespaceDetailsItem resource={provider} />

      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={t(
          'URL of the Openshift Virtualization API endpoint. Empty may be used for the host provider.',
        )}
      />

      <CredentialsDetailsItem resource={provider} />

      <CreatedAtDetailsItem resource={provider} />

      <SecretDetailsItem
        resource={provider}
        helpContent={`A Secret containing credentials and other confidential information.
          Empty may be used for the host provider.`}
      />

      <OwnerDetailsItem resource={provider} />

      <TransferNetworkDetailsItem resource={provider} canPatch={permissions.canPatch} />
    </DescriptionList>
  );
};
