import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { CredentialsDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/ExternalManagementLinkDetailsItem';
import { TransferNetworkDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/TransferNetworkDetailsItem';
import { TypeDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/URLDetailsItem';
import { getOpenshiftProviderWebUILink } from 'src/modules/Providers/views/details/components/DetailsSection/utils/getOpenshiftProviderWebUILink';
import { useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const OpenshiftDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
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

        {/* Avoid displaying the external web ui link for the local cluster */}
        {provider?.spec?.url ? (
          <ExternalManagementLinkDetailsItem
            resource={provider}
            canPatch={permissions.canPatch}
            webUILinkText={t(`OpenShift web console UI`)}
            webUILink={getOpenshiftProviderWebUILink(provider)}
          />
        ) : (
          <DetailsItem title={''} content={''} />
        )}

        <NameDetailsItem resource={provider} />
        <NamespaceDetailsItem resource={provider} />
        <URLDetailsItem
          resource={provider}
          canPatch={permissions.canPatch}
          helpContent={t(
            'URL of the Openshift Virtualization API endpoint. Empty might be used for the host provider.',
          )}
        />
        <CredentialsDetailsItem resource={provider} />
        <CreatedAtDetailsItem resource={provider} />
        <TransferNetworkDetailsItem resource={provider} canPatch={permissions.canPatch} />
        <OwnerDetailsItem resource={provider} />
      </DescriptionList>
    </ModalHOC>
  );
};

export default OpenshiftDetailsSection;
