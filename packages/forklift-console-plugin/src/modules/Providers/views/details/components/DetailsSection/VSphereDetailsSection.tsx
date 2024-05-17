import React from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

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
  VDDKDetailsItem,
} from './components';
import { DetailsSectionProps } from './DetailsSection';

export const VSphereDetailsSection: React.FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { provider, permissions } = data;

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />

      <DetailsItem
        title={t('Product')}
        content={data.inventory?.['product'] || <span className="text-muted">{t('Empty')}</span>}
        helpContent={t(`VMware only: vSphere product name.`)}
        crumbs={['Inventory', 'providers', `${provider.spec.type}`, '[UID]']}
      />

      <NameDetailsItem resource={provider} />

      <NamespaceDetailsItem resource={provider} />

      <URLDetailsItem
        resource={provider}
        canPatch={permissions.canPatch}
        helpContent={
          <ForkliftTrans>
            URL of the API endpoint of the vCenter on which the source VM is mounted. Ensure that
            the URL includes the sdk path, usually <strong>/sdk</strong>.<br />
            <br />
            For example: <strong>https://vCenter-host-example.com/sdk</strong>.<br />
            <br />
            If a certificate for FQDN is specified, the value of this field needs to match the FQDN
            in the certificate.
          </ForkliftTrans>
        }
      />

      <CredentialsDetailsItem resource={provider} />

      <CreatedAtDetailsItem resource={provider} />

      <VDDKDetailsItem resource={provider} canPatch={permissions.canPatch} />

      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};
