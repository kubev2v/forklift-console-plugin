import React from 'react';
import { ForkliftTrans } from 'src/utils/i18n';

import { DescriptionList } from '@patternfly/react-core';

import { DetailsItem } from '../../../../utils';

import {
  CreatedAtDetailsItem,
  CredentialsDetailsItem,
  NameDetailsItem,
  NamespaceDetailsItem,
  OwnerDetailsItem,
  TypeDetailsItem,
  URLDetailsItem,
} from './components';
import { DetailsSectionProps } from './DetailsSection';

export const OpenstackDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
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
