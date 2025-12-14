import type { FC } from 'react';
import { TypeDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/TypeDetailsItem';
import { URLDetailsItem } from 'src/modules/Providers/views/details/components/DetailsSection/components/URLDetailsItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import CreatedAtDetailsItem from '@components/DetailItems/CreatedAtDetailItem';
import NameDetailsItem from '@components/DetailItems/NameDetailItem';
import NamespaceDetailsItem from '@components/DetailItems/NamespaceDetailItem';
import OwnerDetailsItem from '@components/DetailItems/OwnerDetailItem';
import { DescriptionList } from '@patternfly/react-core';

import type { DetailsSectionProps } from './utils/types';

const HyperVDetailsSection: FC<DetailsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { provider } = data;

  if (!provider) return null;

  return (
    <DescriptionList
      columnModifier={{
        default: '2Col',
      }}
    >
      <TypeDetailsItem resource={provider} />
      <NameDetailsItem resource={provider} />
      <NamespaceDetailsItem resource={provider} />
      <URLDetailsItem
        resource={provider}
        canPatch={false}
        helpContent={t(
          `URL of the SMB file share that serves the Hyper-V exported VMs, for example: //server/share or \\\\server\\share`,
        )}
      />
      <CreatedAtDetailsItem resource={provider} />
      <OwnerDetailsItem resource={provider} />
    </DescriptionList>
  );
};

export default HyperVDetailsSection;
