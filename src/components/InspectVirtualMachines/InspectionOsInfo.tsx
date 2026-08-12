import type { FC } from 'react';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import { DescriptionList } from '@patternfly/react-core';
import type { InspectionResult } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type InspectionOsInfoProps = {
  filesystems: InspectionResult['filesystems'];
  osInfo: InspectionResult['osInfo'];
};

const InspectionOsInfo: FC<InspectionOsInfoProps> = ({ filesystems, osInfo }) => {
  const { t } = useForkliftTranslation();

  return (
    <DescriptionList columnModifier={{ default: '2Col' }} isCompact>
      {osInfo?.name && <DetailsItem content={osInfo.name} title={t('OS')} />}
      {osInfo?.distro && <DetailsItem content={osInfo.distro} title={t('Distribution')} />}
      {osInfo?.version && <DetailsItem content={osInfo.version} title={t('Version')} />}
      {!isEmpty(filesystems) && (
        <DetailsItem
          content={filesystems?.map((fs) => `${fs.device} (${fs.type})`).join(', ')}
          title={t('Filesystems')}
        />
      )}
      {osInfo?.arch && <DetailsItem content={osInfo.arch} title={t('Architecture')} />}
    </DescriptionList>
  );
};

export default InspectionOsInfo;
