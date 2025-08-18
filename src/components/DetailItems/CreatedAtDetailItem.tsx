import type { FC } from 'react';
import { ConsoleTimestamp } from 'src/components/ConsoleTimestamp/ConsoleTimestamp';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getCreatedAt } from '@utils/crds/common/selectors';
import { MORE_INFO_CREATED_AT_DETAIL_ITEM } from '@utils/links';

import type { ResourceDetailsItemProps } from './utils/types';

const CreatedAtDetailsItem: FC<ResourceDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(
    `CreationTimestamp is a timestamp representing the server time when this object was created.
    It is not guaranteed to be set in happens-before order across separate operations.
    Clients may not set this value. It is represented in RFC3339 form and is in UTC.`,
  );

  return (
    <DetailsItem
      data-testid="created-at-detail-item"
      title={t('Created at')}
      content={<ConsoleTimestamp timestamp={getCreatedAt(resource)} />}
      moreInfoLink={moreInfoLink ?? MORE_INFO_CREATED_AT_DETAIL_ITEM}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'creationTimestamp']}
    />
  );
};

export default CreatedAtDetailsItem;
