import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import { OwnerReferencesItem } from 'src/modules/Providers/utils/components/DetailsPage/OwnerReferencesItem';
import { useForkliftTranslation } from 'src/utils/i18n';

import { MORE_INFO_OWNER_DETAIL_ITEM } from '@utils/links';

import type { ResourceDetailsItemProps } from './utils/types';

const OwnerDetailsItem: FC<ResourceDetailsItemProps> = ({
  helpContent,
  moreInfoLink,
  resource,
}) => {
  const { t } = useForkliftTranslation();

  const defaultHelpContent = t(
    `List of objects depended by this object. If ALL objects in the list have been deleted,
    this object will be garbage collected. If this object is managed by a controller,
    then an entry in this list will point to this controller, with the controller field set to true.
    There cannot be more than one managing controller.`,
  );

  return (
    <DetailsItem
      data-testid="owner-detail-item"
      title={t('Owner')}
      content={<OwnerReferencesItem resource={resource} />}
      moreInfoLink={moreInfoLink ?? MORE_INFO_OWNER_DETAIL_ITEM}
      helpContent={helpContent ?? defaultHelpContent}
      crumbs={['metadata', 'ownerReferences']}
    />
  );
};

export default OwnerDetailsItem;
