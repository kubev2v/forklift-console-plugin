import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { CredentialsDetailsItem } from 'src/providers/details/components/DetailsSection/components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from 'src/providers/details/components/DetailsSection/components/ExternalManagementLinkDetailsItem';
import { TypeDetailsItem } from 'src/providers/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/providers/details/components/DetailsSection/components/URLDetailsItem';
import { getVSphereProviderWebUILink } from 'src/providers/details/components/DetailsSection/utils/getVSphereProviderWebUILink';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import type { VSphereProvider } from '@forklift-ui/types';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';
import { VDDKDetailsItem } from './VDDKDetailsItem';
const VSphereDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { inventory, permissions, provider } = data;

  if (!provider || !permissions) {
    return null;
  }

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />
      <DetailsItem
        content={
          (inventory as VSphereProvider)?.product || (
            <span className="text-muted">{t('Empty')}</span>
          )
        }
        crumbs={['Inventory', 'providers', provider.spec?.type ?? '', '[UID]']}
        helpContent={t(`VMware only: vSphere product name.`)}
        testId="product-detail-item"
        title={t('Product')}
      />
      <NameDetailsItem resource={provider} />
      <ExternalManagementLinkDetailsItem
        canPatch={permissions.canPatch}
        resource={provider}
        webUILink={getVSphereProviderWebUILink(provider)}
        webUILinkText={t(`VMware vSphere UI`)}
      />
      <URLDetailsItem
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
        resource={provider}
      />
      <NamespaceDetailsItem resource={provider} />
      <CredentialsDetailsItem resource={provider} />
      <CreatedAtDetailsItem resource={provider} />
      <OwnerDetailsItem resource={provider} />
      <VDDKDetailsItem canPatch={permissions.canPatch} resource={provider} />
    </DescriptionList>
  );
};

export default VSphereDetailsSection;
