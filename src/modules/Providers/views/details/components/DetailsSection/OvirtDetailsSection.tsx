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
  TypeDetailsItem,
  URLDetailsItem,
} from './components';
import type { DetailsSectionProps } from './DetailsSection';
import { getOvirtProviderWebUILink } from './utils';

export const OvirtDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { permissions, provider } = data;
  const webUILink = getOvirtProviderWebUILink(provider);

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />

      <ExternalManagementLinkDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        webUILinkText={t(`Red Hat Virtualization Manager UI`)}
        webUILink={webUILink}
      />

      <NameDetailsItem resource={provider} />

      <NamespaceDetailsItem resource={provider} />

      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={t(
          `URL of the API endpoint of the Red Hat Virtualization Manager (RHVM) on which the source VM is mounted. Ensure that the URL includes the path leading to the RHVM API server, usually /ovirt-engine/api. For example, https://rhv-host-example.com/ovirt-engine/api.`,
        )}
      />

      <CredentialsDetailsItem resource={provider} />

      <CreatedAtDetailsItem resource={provider} />

      <DetailsItem title={''} content={''} />

      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};
