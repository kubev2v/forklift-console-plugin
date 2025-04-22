import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { CreatedAtDetailsItem } from './components/CreatedAtDetailsItem';
import { CredentialsDetailsItem } from './components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from './components/ExternalManagementLinkDetailsItem';
import { NameDetailsItem } from './components/NamDetailsItem';
import { NamespaceDetailsItem } from './components/NamespaceDetailsItem';
import { OwnerDetailsItem } from './components/OwnerDetailsItem';
import { TypeDetailsItem } from './components/TypeDetailsItem';
import { URLDetailsItem } from './components/URLDetailsItem';
import { getOpenstackProviderWebUILink } from './utils/getOpenstackProviderWebUILink';
import type { DetailsSectionProps } from './DetailsSection';

export const OpenstackDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;
  const webUILink = getOpenstackProviderWebUILink(provider);

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
        webUILinkText={t(`OpenStack dashboard UI`)}
        webUILink={webUILink}
      />

      <NameDetailsItem resource={provider} />

      <NamespaceDetailsItem resource={provider} />

      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={
          <ForkliftTrans>
            URL of the OpenStack Identity (Keystone) endpoint. For example:{' '}
            <strong>https://identity_service.com:5000/v3</strong>.
          </ForkliftTrans>
        }
      />

      <CredentialsDetailsItem resource={provider} />

      <CreatedAtDetailsItem resource={provider} />

      <DetailsItem title={''} content={''} />

      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};
