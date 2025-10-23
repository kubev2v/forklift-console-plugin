import type { FC } from 'react';
import { CredentialsDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/ExternalManagementLinkDetailsItem';
import { TypeDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/URLDetailsItem';
import { getOpenstackProviderWebUILink } from 'src/modules/Providers/views/details/components/DetailsSection/utils/getOpenstackProviderWebUILink';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const OpenstackDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;

  if (!provider || !permissions) return null;

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
        webUILink={getOpenstackProviderWebUILink(provider)}
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
      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export default OpenstackDetailsSection;
