import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { CredentialsDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/ExternalManagementLinkDetailsItem';
import { TypeDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/URLDetailsItem';
import { VDDKDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/VDDKDetailsItem';
import { getVSphereProviderWebUILink } from 'src/modules/Providers/views/details/components/DetailsSection/utils/getVSphereProviderWebUILink';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import type { VSphereProvider } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const VSphereDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { inventory, permissions, provider } = data;

  if (!provider || !permissions) return null;

  return (
    <ModalHOC>
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        <TypeDetailsItem resource={provider} />
        <DetailsItem
          testId="product-detail-item"
          title={t('Product')}
          content={
            (inventory as VSphereProvider)?.product || (
              <span className="text-muted">{t('Empty')}</span>
            )
          }
          helpContent={t(`VMware only: vSphere product name.`)}
          crumbs={['Inventory', 'providers', provider.spec?.type ?? '', '[UID]']}
        />
        <NameDetailsItem resource={provider} />
        <ExternalManagementLinkDetailsItem
          resource={provider}
          canPatch={permissions.canPatch}
          webUILinkText={t(`VMware vSphere UI`)}
          webUILink={getVSphereProviderWebUILink(provider)}
        />
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
              If a certificate for FQDN is specified, the value of this field needs to match the
              FQDN in the certificate.
            </ForkliftTrans>
          }
        />
        <NamespaceDetailsItem resource={provider} />
        <CredentialsDetailsItem resource={provider} />
        <CreatedAtDetailsItem resource={provider} />
        <OwnerDetailsItem resource={provider} />
        <VDDKDetailsItem resource={provider} canPatch={permissions.canPatch} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default VSphereDetailsSection;
