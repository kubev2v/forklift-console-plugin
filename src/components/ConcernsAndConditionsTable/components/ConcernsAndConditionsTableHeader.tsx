import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Th, Thead, Tr } from '@patternfly/react-table';

const ConcernsAndConditionsTableHeader: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Thead>
      <Tr>
        <Th width={10}>{t('Label')}</Th>
        <Th width={10}>{t('Category')}</Th>
        <Th width={30}>{t('Assessment')}</Th>
      </Tr>
    </Thead>
  );
};

export default ConcernsAndConditionsTableHeader;
