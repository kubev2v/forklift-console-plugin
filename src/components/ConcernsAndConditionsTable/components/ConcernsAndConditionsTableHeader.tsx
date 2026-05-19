import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Th, Thead, Tr } from '@patternfly/react-table';

const ConcernsAndConditionsTableHeader: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <Thead>
      <Tr>
        <Th width={10}>{t('Issue')}</Th>
        <Th width={10}>{t('Severity')}</Th>
        <Th width={30}>{t('Description')}</Th>
      </Tr>
    </Thead>
  );
};

export default ConcernsAndConditionsTableHeader;
