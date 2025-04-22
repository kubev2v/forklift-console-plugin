import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { CreatedAtDetailsItem } from './components/CreatedAtDetailsItem';
import { CredentialsDetailsItem } from './components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from './components/ExternalManagementLinkDetailsItem';
import { NameDetailsItem } from './components/NamDetailsItem';
import { NamespaceDetailsItem } from './components/NamespaceDetailsItem';
import { OwnerDetailsItem } from './components/OwnerDetailsItem';
import { TypeDetailsItem } from './components/TypeDetailsItem';
import { URLDetailsItem } from './components/URLDetailsItem';
import { getOvirtProviderWebUILink } from './utils/getOvirtProviderWebUILink';
import type { DetailsSectionProps } from './DetailsSection';

export const OvirtDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
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
