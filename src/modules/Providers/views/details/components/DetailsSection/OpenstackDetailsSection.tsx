import React from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

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
import { getOpenstackProviderWebUILink } from './utils';

export const OpenstackDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
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
