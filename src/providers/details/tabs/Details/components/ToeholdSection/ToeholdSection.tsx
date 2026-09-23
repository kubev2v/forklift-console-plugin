import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { DescriptionList, PageSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import ToeholdRebuildDetailsItem from '../DetailsSection/ToeholdRebuildDetailsItem';
import ToeholdSettingDetailsItem from '../DetailsSection/ToeholdSettingDetailsItem';
import ToeholdTemplateDetailsItem from '../DetailsSection/ToeholdTemplateDetailsItem';

type ToeholdSectionProps = {
  data: ProviderData;
};

const ToeholdSection: FC<ToeholdSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { permissions, provider } = data;

  if (provider?.spec?.type !== PROVIDER_TYPES.vsphere || !provider || !permissions) {
    return null;
  }

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <SectionHeading text={t('Toehold')} />
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        <ToeholdSettingDetailsItem
          canPatch={permissions.canPatch}
          field="datastore"
          resource={provider}
        />
        <ToeholdSettingDetailsItem
          canPatch={permissions.canPatch}
          field="folder"
          resource={provider}
        />
        <ToeholdSettingDetailsItem
          canPatch={permissions.canPatch}
          field="network"
          resource={provider}
        />
        <ToeholdSettingDetailsItem
          canPatch={permissions.canPatch}
          field="resourcePool"
          resource={provider}
        />
        <ToeholdTemplateDetailsItem resource={provider} />
        <ToeholdRebuildDetailsItem canPatch={permissions.canPatch} resource={provider} />
      </DescriptionList>
    </PageSection>
  );
};

export default ToeholdSection;
