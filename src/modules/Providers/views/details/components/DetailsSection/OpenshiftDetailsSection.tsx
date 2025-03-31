import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import {
  CreatedAtDetailsItem,
  CredentialsDetailsItem,
  ExternalManagementLinkDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
  TransferNetworkDetailsItem,
  TypeDetailsItem,
  URLDetailsItem,
} from './components';
import type { DetailsSectionProps } from './DetailsSection';
import { getOpenshiftProviderWebUILink } from './utils';

export const OpenshiftDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = data;
  const webUILink = getOpenshiftProviderWebUILink(provider);

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />

      {/* Avoid displaying the external web ui link for the local cluster */}
      {provider?.spec?.url ? (
        <ExternalManagementLinkDetailsItem
          resource={provider}
          canPatch={permissions.canPatch}
          webUILinkText={t(`OpenShift web console UI`)}
          webUILink={webUILink}
        />
      ) : (
        <DetailsItem title={''} content={''} />
      )}

      <NameDetailsItem resource={provider} />

      <NamespaceDetailsItem resource={provider} />

      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={t(
          'URL of the Openshift Virtualization API endpoint. Empty might be used for the host provider.',
        )}
      />

      <CredentialsDetailsItem resource={provider} />

      <CreatedAtDetailsItem resource={provider} />

      <TransferNetworkDetailsItem resource={provider} canPatch={permissions.canPatch} />

      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};
