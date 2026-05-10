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
    <DescriptionList isCompact columnModifier={{ default: '2Col' }}>
      {osInfo?.name && <DetailsItem title={t('OS')} content={osInfo.name} />}
      {osInfo?.distro && <DetailsItem title={t('Distribution')} content={osInfo.distro} />}
      {osInfo?.version && <DetailsItem title={t('Version')} content={osInfo.version} />}
      {!isEmpty(filesystems) && (
        <DetailsItem
          title={t('Filesystems')}
          content={filesystems!.map((fs) => `${fs.device} (${fs.type})`).join(', ')}
        />
      )}
      {osInfo?.arch && <DetailsItem title={t('Architecture')} content={osInfo.arch} />}
    </DescriptionList>
  );
};

export default InspectionOsInfo;
