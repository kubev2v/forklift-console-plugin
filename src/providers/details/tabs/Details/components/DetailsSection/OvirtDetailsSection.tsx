import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { CredentialsDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/ExternalManagementLinkDetailsItem';
import { TypeDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/URLDetailsItem';
import { getOvirtProviderWebUILink } from 'src/modules/Providers/views/details/components/DetailsSection/utils/getOvirtProviderWebUILink';
import { useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const OvirtDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;

  if (!provider || !permissions) return null;

  return (
    <ModalHOC>
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
          webUILink={getOvirtProviderWebUILink(provider)}
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
        <OwnerDetailsItem resource={provider} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default OvirtDetailsSection;
