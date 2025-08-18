import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getName } from '@utils/crds/common/selectors';
import { MORE_INFO_NAME_DETAIL_ITEM } from '@utils/links';

import type { ResourceDetailsItemProps } from './utils/types';

const NameDetailsItem: FC<ResourceDetailsItemProps> = ({ helpContent, moreInfoLink, resource }) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(
    'Name is primarily intended for creation idempotence and configuration definition. Cannot be updated.',
  );

  return (
    <DetailsItem
      data-testid="name-detail-item"
      title={t('Name')}
      content={getName(resource)}
      moreInfoLink={moreInfoLink ?? MORE_INFO_NAME_DETAIL_ITEM}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'name']}
    />
  );
};

export default NameDetailsItem;
