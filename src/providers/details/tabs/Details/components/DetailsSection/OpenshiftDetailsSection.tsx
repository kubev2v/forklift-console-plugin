import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { CredentialsDetailsItem } from 'src/providers/details/components/DetailsSection/components/CredentialsDetailsItem';
import { ExternalManagementLinkDetailsItem } from 'src/providers/details/components/DetailsSection/components/ExternalManagementLinkDetailsItem';
import { TransferNetworkDetailsItem } from 'src/providers/details/components/DetailsSection/components/TransferNetworkDetailsItem';
import { TypeDetailsItem } from 'src/providers/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/providers/details/components/DetailsSection/components/URLDetailsItem';
import { getOpenshiftProviderWebUILink } from 'src/providers/details/components/DetailsSection/utils/getOpenshiftProviderWebUILink';
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

      {/* Avoid displaying the external web ui link for the local cluster */}
      {provider?.spec?.url ? (
        <ExternalManagementLinkDetailsItem
          canPatch={permissions.canPatch}
          resource={provider}
          webUILink={getOpenshiftProviderWebUILink(provider)}
          webUILinkText={t(`OpenShift web console UI`)}
        />
      ) : (
        <DetailsItem content={''} title={''} />
      )}

      <NameDetailsItem resource={provider} />
      <NamespaceDetailsItem resource={provider} />
      <URLDetailsItem
        canPatch={permissions.canPatch}
        helpContent={t(
          'URL of the Openshift Virtualization API endpoint. Empty might be used for the host provider.',
        )}
        resource={provider}
      />
      <CredentialsDetailsItem resource={provider} />
      <CreatedAtDetailsItem resource={provider} />
      <TransferNetworkDetailsItem canPatch={permissions.canPatch} resource={provider} />
      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export default OpenshiftDetailsSection;
